import { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { deleteData, readData } from "@/firebase";
import { EVENT_SORT_CRITERIA } from "@/consts";
import {
  EventSearchType,
  EventSortType,
  EventTagNameType,
  EventType,
} from "@/types";
import { sleep } from "@/utils";
import { useIdentification, useToast } from "@/hooks";
import { QueryConstraint, where } from "firebase/firestore";

export interface useSearchEventProps {
  type?: EventSearchType;
}

export function useEvent({ type }: useSearchEventProps) {
  const stateFilters = useState<EventTagNameType[]>([]);
  const filters = stateFilters[0];
  const atLeastOneFilter = useMemo(() => filters.length > 0, [filters.length]);
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
  const { addToast, addToastPreset } = useToast();

  const validatedEvents = useMemo(() => {
    if (userQuery !== "" || atLeastOneFilter) {
      return events;
    }
    return [];
  }, [atLeastOneFilter, events, userQuery]);

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

  const filterByMethod = useMemo(
    () => [
      type === "userCreatedEvents" && user && where("authorId", "==", user.uid),
      ...filters.map((tag) => where(`tags.${tag}`, "==", true)),
    ],
    [filters, type, user]
  );

  const queryConstraints = useMemo(
    () => [
      ...(filterByMethod.filter(
        (constraint) => constraint
      ) as QueryConstraint[]),
    ],
    [filterByMethod]
  );

  const handleFetchEvents = useCallback(async () => {
    let eventArray = [] as EventType[];
    await readData("events", {
      constraints: queryConstraints,
    }).then((result) => {
      if (result) {
        eventArray = result;
        setEvents(result);
      }
    });
    return eventArray;
  }, [queryConstraints, setEvents]);

  const handleFetchEventsInOneMonthPage = useCallback(
    async (month: number, year: number) => {
      const baseDate = new Date();
      baseDate.setMonth(month);
      baseDate.setFullYear(year);
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

      // await getEvents("events", [
      //   orderByChild("startDate"),
      //   startAt(first.getTime()),
      //   endAt(last.getTime()),
      // ]).then((res) => {
      //   eventArray = res;
      //   setEvents(res);
      // });

      await readData("events", {
        constraints: [
          where("startDate", ">=", first.getTime()),
          where("startDate", "<=", last.getTime()),
        ],
      })
        .then((result) => {
          if (result) {
            eventArray = result;
            setEvents(result);
          }
        })
        .catch(() => {
          addToastPreset("get-fail");
        });

      return eventArray;
    },
    [addToastPreset, setEvents]
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
      await deleteData("event", {
        id: eventId,
      })
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
      handleFetchEvents,
      handleDeleteEvent,
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
