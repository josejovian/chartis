import { useCallback, useMemo, useState } from "react";
import _ from "lodash";
import {
  EVENT_SORT_CRITERIA,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";
import {
  EventSearchType,
  EventSortNameType,
  EventTagNameType,
  EventType,
} from "@/types";
import { compareEventValues, sleep } from "@/utils";
import { useIdentification, useToast } from "@/hooks";
import {
  QueryConstraint,
  arrayRemove,
  arrayUnion,
  deleteField,
  increment,
  orderBy,
  where,
} from "firebase/firestore";
import {
  BatchOperationType,
  deleteData,
  readData,
  updateData,
  uploadImage,
  writeDataBatch,
} from "@/firebase";
import pushid from "pushid";

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
          const left = a[sortBy.key] ?? 0;
          const right = b[sortBy.key] ?? 0;
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortBy.descending ? -1 : 1);
          return 0;
        }),
    [validatedEvents, type, user, userQuery, sortBy.key, sortBy.descending]
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
    async (month: number, year: number): Promise<EventType[]> => {
      const firstDayOfTheMonth = new Date(year, month, 1, 0, 0, 0);
      const lastDayOfTheMonth = new Date(year, month + 1, 1, 0, 0, 0);

      let eventArray = [] as EventType[];

      await readData("events", [
        where("startDate", ">=", firstDayOfTheMonth.getTime()),
        where("startDate", "<", lastDayOfTheMonth.getTime()),
      ])
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

  const createEvent = useCallback(
    async (event: EventType, thumbnailImage?: Blob): Promise<void> => {
      const batchOperations: BatchOperationType[] = [];
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_EVENTS,
        operationType: "create",
        documentId: event.id,
        value: event,
      });
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_UPDATES,
        operationType: "create",
        documentId: event.id,
        value: {
          updates: [],
        },
      });

      return writeDataBatch(batchOperations).then(() => {
        if (thumbnailImage) {
          return uploadImage(event.id, thumbnailImage).then((imageURL) => {
            return updateData(FIREBASE_COLLECTION_EVENTS, event.id, {
              thumbnailSrc: imageURL,
            });
          });
        }
      });
    },
    []
  );

  const updateEventNew = useCallback(
    async (eventId: string, previousValue: EventType, newValue: EventType) => {
      const eventUpdateId = pushid();
      const batchOperations: BatchOperationType[] = [];
      const updateDocumentExists = await readData(
        FIREBASE_COLLECTION_UPDATES,
        eventId
      );
      const databaseEventData = (await readData(
        FIREBASE_COLLECTION_EVENTS,
        eventId
      )) as EventType;

      const changes = compareEventValues(previousValue, newValue);

      if (!updateDocumentExists) {
        batchOperations.push({
          collectionName: FIREBASE_COLLECTION_UPDATES,
          documentId: eventId,
          operationType: "create",
          value: {
            eventId: eventId,
            updates: [],
          },
        });
      }

      if (databaseEventData.subscriberIds) {
        batchOperations.push(
          ...databaseEventData.subscriberIds.map(
            (userId) =>
              ({
                collectionName: FIREBASE_COLLECTION_USERS,
                documentId: userId,
                operationType: "update",
                value: {
                  [`unseenEvents.${eventId}`]: true,
                },
              } as BatchOperationType)
          )
        );
      }

      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_EVENTS,
        documentId: eventId,
        operationType: "update",
        value: {
          ...(newValue as Partial<EventType>),
          version: increment(1),
          lastUpdatedAt: new Date().getTime(),
        },
      });

      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_UPDATES,
        documentId: eventId,
        operationType: "update",
        value: {
          eventId: eventId,
          updates: arrayUnion({
            updateId: eventUpdateId,
            updates: changes,
          }),
        },
      });

      return writeDataBatch(batchOperations);
    },
    []
  );

  const toggleEventSubscription = useCallback(
    async (
      eventId: string,
      eventVersion: number,
      currentlySubscribed: boolean,
      userId?: string
    ): Promise<void> => {
      // for guest
      if (!userId) {
        return updateData("events", eventId, {
          guestSubscriberCount: (currentlySubscribed
            ? increment(-1)
            : increment(1)) as unknown as number,
        }).then(() => {
          const subscribe = JSON.parse(
            localStorage.getItem("subscribe") ?? "{}"
          ) as Record<string, number>;
          const newSubscribe = currentlySubscribed
            ? (() => {
                const temp = { ...subscribe };
                delete temp[eventId];
                return temp;
              })()
            : {
                ...subscribe,
                [eventId]: eventVersion,
              };
          localStorage.setItem("subscribe", JSON.stringify(newSubscribe));
        });
      }

      // for registered user
      return writeDataBatch([
        {
          collectionName: FIREBASE_COLLECTION_USERS,
          documentId: userId,
          operationType: "update",
          value: {
            [`subscribedEvents.${eventId}`]: currentlySubscribed
              ? deleteField()
              : eventVersion,
            [`unseenEvents.${eventId}`]: currentlySubscribed
              ? deleteField()
              : false,
          },
        },
        {
          collectionName: FIREBASE_COLLECTION_EVENTS,
          documentId: eventId,
          operationType: "update",
          value: {
            subscriberIds: currentlySubscribed
              ? arrayRemove(userId)
              : arrayUnion(userId),
            subscriberCount: currentlySubscribed ? increment(-1) : increment(1),
          },
        },
      ]);
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
      updateEventNew,
      deleteEvent: handleDeleteEvent,
      createEvent,
      sortEvents,
      filterEvents,
      toggleEventSubscription,
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
      updateEventNew,
      handleDeleteEvent,
      createEvent,
      sortEvents,
      filterEvents,
      toggleEventSubscription,
      stateUserQuery,
      stateEvents,
      stateFilters,
      stateSort,
      stateSortDescending,
      stateModalDelete,
    ]
  );
}
