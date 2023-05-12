import { useCallback, useMemo } from "react";
import {
  FIREBASE_COLLECTION_COMMENTS,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";
import { EventType } from "@/types";
import { compareEventValues } from "@/utils";
import { useIdentification } from "@/hooks";
import {
  QueryConstraint,
  arrayRemove,
  arrayUnion,
  deleteField,
  increment,
  where,
} from "firebase/firestore";
import {
  BatchOperationType,
  deleteImage,
  readData,
  updateData,
  uploadImage,
  writeDataBatch,
} from "@/firebase";
import pushid from "pushid";

export function useEvent() {
  const { stateIdentification } = useIdentification();
  const [identification] = stateIdentification;
  const { user } = identification;

  const getEvents = useCallback(
    async (queryConstraints: QueryConstraint[]): Promise<EventType[]> => {
      return readData("events", queryConstraints);
    },
    []
  );

  const getEventsMonthly = useCallback(
    async (month: number, year: number): Promise<EventType[]> => {
      const firstDayOfTheMonth = new Date(year, month, 1, 0, 0, 0);
      const lastDayOfTheMonth = new Date(year, month + 1, 1, 0, 0, 0);

      return readData("events", [
        where("startDate", ">=", firstDayOfTheMonth.getTime()),
        where("startDate", "<", lastDayOfTheMonth.getTime()),
      ]);
    },
    []
  );

  const getFollowedEvents = useCallback(async (): Promise<
    (EventType | undefined)[]
  > => {
    const subscribedEventIds: Record<string, number> =
      user && user.id
        ? identification.users[user.id].subscribedEvents
        : JSON.parse(localStorage.getItem("subscribe") ?? "{}");

    return Promise.all(
      Object.keys(subscribedEventIds).map((eventId) =>
        readData(FIREBASE_COLLECTION_EVENTS, eventId)
      )
    );
  }, [identification.users, user]);

  const createEvent = useCallback(async (event: EventType): Promise<void> => {
    const eventDefault = {
      id: "",
      authorId: "",
      thumbnailURL: "",
      name: "",
      tags: {},
      organizer: "",
      location: "",
      startDate: new Date(-1).getTime(),
      endDate: new Date(-1).getTime(),
      description: "",
      postedAt: new Date(-1).getTime(),
      lastUpdatedAt: new Date(-1).getTime(),
      subscriberCount: 0,
      subscriberIds: [],
      isHidden: false,
    };
    const thumbnailImage = event.thumbnailSrc;
    event.thumbnailSrc = "";
    const batchOperations: BatchOperationType[] = [];

    // create event document
    batchOperations.push({
      collectionName: FIREBASE_COLLECTION_EVENTS,
      operationType: "create",
      documentId: event.id,
      value: {
        ...eventDefault,
        ...event,
      },
    });

    // create update document
    batchOperations.push({
      collectionName: FIREBASE_COLLECTION_UPDATES,
      operationType: "create",
      documentId: event.id,
      value: {
        authorId: event.authorId,
        eventId: event.id,
        lastUpdatedAt: new Date().getTime(),
        updates: [],
      },
    });

    // create comment document
    batchOperations.push({
      collectionName: FIREBASE_COLLECTION_COMMENTS,
      operationType: "create",
      documentId: event.id,
      value: {},
    });

    return writeDataBatch(batchOperations).then(() => {
      if (thumbnailImage) {
        return uploadImage(event.id, thumbnailImage as unknown as Blob).then(
          (imageURL) => {
            return updateData(FIREBASE_COLLECTION_EVENTS, event.id, {
              thumbnailSrc: imageURL,
            });
          }
        );
      }
    });
  }, []);

  const updateEvent = useCallback(
    async (
      eventId: string,
      previousValue: EventType,
      newValue: EventType,
      authorId: string
    ): Promise<EventType> => {
      const thumbnailImage = newValue.thumbnailSrc;
      const different = previousValue.thumbnailSrc !== newValue.thumbnailSrc;

      if (different) newValue.thumbnailSrc = "";

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
            authorId,
            updateId: eventUpdateId,
            updates: changes,
            date: new Date().getTime(),
          }),
        },
      });

      return writeDataBatch(batchOperations).then(() => {
        if (different) {
          return uploadImage(eventId, thumbnailImage as unknown as Blob).then(
            (imageURL) => {
              return updateData(FIREBASE_COLLECTION_EVENTS, eventId, {
                thumbnailSrc: imageURL,
              }).then(() => ({
                ...newValue,
                thumbnailSrc: imageURL,
                version: previousValue.version ?? 0 + 1,
              }));
            }
          );
        } else {
          return {
            ...newValue,
            version: previousValue.version ?? 0 + 1,
          };
        }
      }) as Promise<EventType>;
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

  const deleteEvent = useCallback(
    async (
      eventId: string
    ): Promise<[PromiseSettledResult<void>, PromiseSettledResult<void>]> => {
      const batchOperations: BatchOperationType[] = [];

      // delete event document
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_EVENTS,
        operationType: "delete",
        documentId: eventId,
        value: {},
      });

      // delete comment document
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_COMMENTS,
        operationType: "delete",
        documentId: eventId,
        value: {},
      });

      // delete update document
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_UPDATES,
        operationType: "delete",
        documentId: eventId,
        value: {},
      });

      return Promise.allSettled([
        deleteImage(eventId),
        writeDataBatch(batchOperations),
      ]);
    },
    []
  );

  return useMemo(
    () => ({
      getEvents,
      getEventsMonthly,
      getFollowedEvents,
      deleteEvent,
      createEvent,
      toggleEventSubscription,
      updateEvent,
    }),
    [
      getEvents,
      getEventsMonthly,
      getFollowedEvents,
      deleteEvent,
      createEvent,
      toggleEventSubscription,
      updateEvent,
    ]
  );
}
