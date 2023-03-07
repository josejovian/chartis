import { useCallback, useMemo, useState } from "react";
import {
  ref,
  query,
  orderByChild,
  get,
  equalTo,
  QueryConstraint,
  startAt,
  endAt,
} from "firebase/database";
import { db, getDataFromPath } from "@/firebase";
import { EVENT_SORT_CRITERIA, EVENT_TAGS } from "@/consts";
import { EventSearchType, EventSortType, EventType, UserType } from "@/types";
import { filterEventsFromTags } from "@/utils";
import _ from "lodash";
import { useIdentification } from "@/hooks";

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
  const [identification, setIdentification] = stateIdentification;
  const { user } = identification;

  const stateEvents = useState<EventType[]>([]);
  const [events, setEvents] = stateEvents;

  const validatedEvents = useMemo(
    () =>
      userQuery === ""
        ? []
        : atLeastOneFilter
        ? filterEventsFromTags(events, filters)
        : events,
    [atLeastOneFilter, events, filters, userQuery]
  );

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

  const handleFetchUserOfEvents = useCallback(
    async (eventsArray: EventType[]) => {
      const authorIdsOfEventsArray = Object.keys(
        eventsArray.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.authorId]: 0,
          }),
          {}
        )
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userIdObject: Record<string, UserType> = {};
      for (const authorId of authorIdsOfEventsArray) {
        const userData = (await getDataFromPath(
          `/user/${authorId}`
        )) as UserType;
        userIdObject[authorId] = userData;
      }

      setIdentification((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          ...userIdObject,
        },
      }));
    },
    [setIdentification]
  );

  const handleFetchEvents = useCallback(
    async (onSuccess?: (result: EventType[]) => void) => {
      const eventsRef = query(ref(db, "events"), ...queryConstraints);

      const eventsArray = await get(eventsRef)
        .then((result) => {
          const arrayResult = Object.values(result.val()) as EventType[];
          if (!onSuccess) {
            setEvents(arrayResult);
          } else {
            onSuccess(arrayResult);
          }
          return arrayResult;
        })
        .catch(() => {
          return [] as EventType[];
        });

      await handleFetchUserOfEvents(eventsArray);

      return eventsArray;
    },
    [handleFetchUserOfEvents, queryConstraints, setEvents]
  );

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

      const eventsRef = query(
        ref(db, "events"),
        orderByChild("startDate"),
        startAt(first.getTime()),
        endAt(last.getTime())
      );

      const eventsArray = await get(eventsRef)
        .then((result) => {
          const arrayResult = Object.values(result.val()) as EventType[];
          setEvents(arrayResult);
          return arrayResult;
        })
        .catch(() => {
          return [];
        });

      await handleFetchUserOfEvents(eventsArray);

      return eventsArray;
    },
    [handleFetchUserOfEvents, setEvents]
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

  return useMemo(
    () => ({
      filteredEvents,
      handleFetchEvents,
      handleFetchEventsInOneMonthPage,
      handleUpdateEvent,
      stateQuery: stateUserQuery,
      stateEvents,
      stateFilters,
      stateSortBy,
      stateSortDescending,
    }),
    [
      filteredEvents,
      handleFetchEvents,
      handleFetchEventsInOneMonthPage,
      handleUpdateEvent,
      stateEvents,
      stateFilters,
      stateSortBy,
      stateSortDescending,
      stateUserQuery,
    ]
  );
}