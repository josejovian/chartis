import { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import { EVENT_SORT_CRITERIA } from "@/consts";
import {
  EventSearchType,
  EventSortNameType,
  EventTagNameType,
  EventType,
} from "@/types";
import { sleep } from "@/utils";
import { useIdentification, useToast } from "@/hooks";
import { QueryConstraint, orderBy, where } from "firebase/firestore";
import { deleteData, readData } from "@/firebase";

interface useEventProps {
  type?: EventSearchType;
}

export function useEvent({ type }: useEventProps) {
  const stateFilters = useState<EventTagNameType[]>([]);
  const filters = stateFilters[0];
  const atLeastOneFilter = useMemo(() => filters.length > 0, [filters.length]);
  const stateSort = useState<EventSortNameType>("newest");
  const sort = stateSort[0];
  const sortBy = EVENT_SORT_CRITERIA[sort];
  const stateSortDescending = useState(false);
  const stateUserQuery = useState("");
  const userQuery = stateUserQuery[0];
  const { stateIdentification } = useIdentification();
  const [identification] = stateIdentification;
  const { user } = identification;

  const stateEvents = useState<EventType[]>([]);
  const [events, setEvents] = stateEvents;
  const stateModalDelete = useState(false);
  const setModalDelete = stateModalDelete[1];
  const { addToast, addToastPreset } = useToast();

  const validatedEvents = useMemo(() => {
    if (
      userQuery !== "" ||
      atLeastOneFilter ||
      type === "userFollowedEvents" ||
      type === "userCreatedEvents"
    ) {
      return events;
    }
    return [];
  }, [atLeastOneFilter, events, type, userQuery]);

  const filteredEvents = useMemo(() => {
    return validatedEvents
      .filter(({ id, name, subscriberIds = [], hide = false }) => {
        if (hide) {
          return false;
        }
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
        const left = a[sortBy.key] ?? 0;
        const right = b[sortBy.key] ?? 0;
        if (typeof left === "number" && typeof right === "number")
          return (left - right) * (sortBy.descending ? -1 : 1);
        return 0;
      });
  }, [validatedEvents, type, user, userQuery, sortBy.key, sortBy.descending]);

  const filterByMethod = useMemo(
    () => [
      type === "userCreatedEvents" && user && where("authorId", "==", user.uid),
      ...filters.map((tag) => where(`tags.${tag}`, "==", true)),
      where("hide", "!=", true),
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

  const getEvents = useCallback(async (): Promise<EventType[]> => {
    let eventArray = [] as EventType[];
    await readData("events", queryConstraints).then((result) => {
      if (result) {
        eventArray = result;
        setEvents(result);
      }
    });
    return eventArray;
  }, [queryConstraints, setEvents]);

  const getEventsMonthly = useCallback(
    async (
      month: number,
      year: number,
      showHidden = false
    ): Promise<EventType[]> => {
      const firstDayOfTheMonth = new Date(year, month, 1, 0, 0, 0);
      const lastDayOfTheMonth = new Date(year, month + 1, 1, 0, 0, 0);

      let eventArray = [] as EventType[];

      await readData("events", [
        where("startDate", ">=", firstDayOfTheMonth.getTime()),
        where("startDate", "<", lastDayOfTheMonth.getTime()),
      ])
        .then((result) => {
          if (result) {
            eventArray = result.filter((event) => !event.hide || showHidden);
            setEvents(eventArray);
          }
        })
        .catch(() => {
          addToastPreset("get-fail");
        });

      return eventArray;
    },
    [addToastPreset, setEvents]
  );

  const getFollowedEvents = useCallback(
    async (events?: EventType[]): Promise<EventType[]> => {
      const subscribedEventIds =
        user && user.uid
          ? identification.users[user.uid].subscribedEvents
          : JSON.parse(localStorage.getItem("subscribe") ?? "{}");

      let eventArray = [] as EventType[];
      if (!events) {
        eventArray = await readData("events", [
          where("id", "in", subscribedEventIds),
        ]);
      } else {
        eventArray = events.filter((event) => subscribedEventIds[event.id]);
      }

      return eventArray;
    },
    [identification.users, user]
  );

  const sortEvents = useCallback(
    async (
      events: EventType[] | undefined = undefined,
      orderCriterion: keyof EventType,
      sort: "asc" | "desc" = "desc"
    ): Promise<EventType[]> => {
      let eventArray = [] as EventType[];
      if (events) {
        const sortBy = sort === "desc" ? 1 : -1;
        eventArray = events.sort((a, b) => {
          const left = a[orderCriterion] ?? 0;
          const right = b[orderCriterion] ?? 0;
          if (
            (typeof left === "number" && typeof right === "number") ||
            (typeof left === "string" && typeof right === "string")
          )
            if (left > right) {
              return -1 * sortBy;
            }
          if (right > left) {
            return 1 * sortBy;
          }
          return 0;
        });
      } else {
        eventArray = await readData("events", [orderBy(orderCriterion, sort)]);
      }

      return eventArray;
    },
    []
  );

  const filterEvents = useCallback(
    async (
      events: EventType[] | undefined = undefined,
      filterCriteria: EventTagNameType[]
    ): Promise<EventType[]> => {
      let eventArray = [] as EventType[];
      if (events) {
        eventArray = events.filter((event) =>
          filterCriteria.every((criterion) =>
            Object.keys(event.tags).includes(criterion)
          )
        );
      } else {
        eventArray = await readData("events", [
          ...filterCriteria.map((tag) => where(`tags.${tag}`, "==", true)),
        ]);
      }

      return eventArray;
    },
    []
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
      await deleteData("events", eventId)
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
      getEvents,
      getEventsMonthly,
      getFollowedEvents,
      handleUpdateEvent,
      deleteEvent: handleDeleteEvent,
      sortEvents,
      filterEvents,
      stateQuery: stateUserQuery,
      stateEvents,
      stateFilters,
      stateSort,
      stateSortDescending,
      stateModalDelete,
    }),
    [
      filteredEvents,
      getEvents,
      getEventsMonthly,
      getFollowedEvents,
      handleUpdateEvent,
      handleDeleteEvent,
      sortEvents,
      filterEvents,
      stateUserQuery,
      stateEvents,
      stateFilters,
      stateSort,
      stateSortDescending,
      stateModalDelete,
    ]
  );
}
