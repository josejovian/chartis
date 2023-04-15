import { useCallback, useMemo, useState } from "react";
import {
  orderByChild,
  equalTo,
  QueryConstraint,
  startAt,
  endAt,
} from "firebase/database";
import _ from "lodash";
import { getEvents, setDataToPath } from "@/firebase";
import { EVENT_SORT_CRITERIA, EVENT_TAGS } from "@/consts";
import { EventSearchType, EventSortType, EventType } from "@/types";
import { filterEventsFromTags, sleep } from "@/utils";
import { useIdentification, useToast } from "@/hooks";

export interface useSearchEventProps {
  type?: EventSearchType;
}

export function useSearchEvent({ type }: useSearchEventProps) {
  const stateFilters = useState<Record<number, boolean>>(
    EVENT_TAGS.map((_) => false)
  );
  const filters = stateFilters[0];
  const atLeastOneFilter = useMemo(
    () => Object.values(stateFilters[0]).some((f) => f),
    [stateFilters]
  );
  const stateSortBy = useState<EventSortType>(EVENT_SORT_CRITERIA[0]);
  const sortBy = stateSortBy[0];
  const stateSortDescending = useState(false);
  const sortDescending = stateSortDescending[0];
  const stateUserQuery = useState("");
  const userQuery = stateUserQuery[0];
  const stateIdentification = useIdentification();
  const [identification] = stateIdentification;
  const { user } = identification;

  const stateEvents = useState<EventType[]>([]);
  const [events, setEvents] = stateEvents;
  const stateModalDelete = useState(false);
  const setModalDelete = stateModalDelete[1];

  const validatedEvents = useMemo(() => {
    if (type === "userFollowedEvents" || type === "userCreatedEvents") {
      return events;
    }
    if (userQuery === "") {
      return [];
    }
    if (atLeastOneFilter) {
      return filterEventsFromTags(events, filters);
    }
    return events;
  }, [atLeastOneFilter, events, filters, type, userQuery]);

  const filteredEvents = useMemo(
    () =>
      validatedEvents
        .filter(({ id, name, subscriberIds = [] }) => {
          let extraValidation = true;
          if (type === "userFollowedEvents" && user && user.uid) {
            extraValidation = subscriberIds.includes(user.uid);
          } else if (type === "userFollowedEvents") {
            const subscribe = JSON.parse(
              localStorage.getItem("subscribe") ?? "{}"
            );
            extraValidation = subscribe[id];
          }

          const reg = new RegExp(_.escapeRegExp(userQuery), "i");

          return reg.test(name) && extraValidation;
        })
        .sort((a, b) => {
          const left = a[sortBy.id] ?? 0;
          const right = b[sortBy.id] ?? 0;
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortDescending ? -1 : 1);
          return 0;
        }),
    [validatedEvents, type, user, userQuery, sortBy.id, sortDescending]
  );

  const orderByMethod = useMemo(
    () =>
      type === "userCreatedEvents"
        ? orderByChild("authorId")
        : orderByChild(sortBy.id),
    [sortBy.id, type]
  );

  const filterByMethod = useMemo(
    () =>
      type === "userCreatedEvents" && user ? equalTo(user.uid) : undefined,
    [type, user]
  );

  const queryConstraints = useMemo(
    () =>
      [orderByMethod, filterByMethod].filter(
        (constraint) => constraint
      ) as QueryConstraint[],
    [filterByMethod, orderByMethod]
  );

  const handleFetchEvents = useCallback(async () => {
    let eventArray = [] as EventType[];
    await getEvents("events", queryConstraints).then((data) => {
      eventArray = data;
      setEvents(data);
    });
    return eventArray;
  }, [queryConstraints, setEvents]);

  const handleFetchEventsInOneMonthPage = useCallback(
    async (firstDayOfTheMonth: number) => {
      const baseDate = new Date(firstDayOfTheMonth);
      baseDate.setDate(1);
      baseDate.setSeconds(0);
      baseDate.setMinutes(0);
      baseDate.setHours(0);

      const first = new Date(baseDate.getTime());

      const last = new Date(baseDate.getTime());
      first.setDate(0);
      last.setMonth(last.getMonth() + 1);
      last.setDate(2);

      let eventArray = [] as EventType[];

      await getEvents("events", [
        orderByChild("startDate"),
        startAt(first.getTime()),
        endAt(last.getTime()),
      ]).then((res) => {
        eventArray = res;
        setEvents(res);
      });

      return eventArray;
    },
    [setEvents]
  );

  const handleUpdateEvent = useCallback(
    (id: string, newEvt: Partial<EventType>) => {
      setEvents((prev) => {
        const temp = [...prev];
        const inst = temp.filter((instance) => instance.id === id);

        if (inst.length !== 1) return prev;

        const index = temp.indexOf(inst[0]);
        temp[index] = {
          ...temp[index],
          ...newEvt,
        };
        return temp;
      });
    },
    [setEvents]
  );

  const { addToast, addToastPreset } = useToast();

  const handleDeleteEvent = useCallback(
    async ({
      eventId,
      onSuccess,
      onFail,
    }: {
      eventId: string;
      onSuccess?: () => void;
      onFail?: () => void;
    }) => {
      await setDataToPath(`/events/${eventId}/`, {})
        .then(async () => {
          onSuccess && onSuccess();
          setModalDelete(false);
          addToast({
            title: "Event Deleted",
            description: "",
            variant: "success",
          });
          await sleep(200);
          window.location.reload();
        })
        .catch(() => {
          onFail && onFail();
          addToastPreset("post-fail");
        });
    },
    [addToast, addToastPreset, setModalDelete]
  );

  return useMemo(
    () => ({
      filteredEvents,
      handleFetchEvents,
      handleFetchEventsInOneMonthPage,
      handleUpdateEvent,
      deleteEvent: handleDeleteEvent,
      stateQuery: stateUserQuery,
      stateEvents,
      stateFilters,
      stateSortBy,
      stateSortDescending,
      stateModalDelete,
    }),
    [
      filteredEvents,
      handleDeleteEvent,
      handleFetchEvents,
      handleFetchEventsInOneMonthPage,
      handleUpdateEvent,
      stateEvents,
      stateFilters,
      stateModalDelete,
      stateSortBy,
      stateSortDescending,
      stateUserQuery,
    ]
  );
}
