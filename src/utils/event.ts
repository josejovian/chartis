import {
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  FIREBASE_COLLECTION_COMMENTS,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";
import {
  EventTagNameType,
  EventType,
  UpdateNameType,
  UpdateChangedValueType,
  CommentType,
  DatabaseCommentType,
} from "@/types";
import { strDateTime } from "./date";
import {
  BatchOperationType,
  deleteImage,
  readData,
  updateData,
  uploadImage,
  writeDataBatch,
} from "@/utils";
import {
  QueryConstraint,
  arrayRemove,
  arrayUnion,
  deleteField,
  increment,
  where,
} from "firebase/firestore";
import pushid from "pushid";

export function filterEventsFromTags(
  events: EventType[],
  filters: EventTagNameType[]
) {
  return events.filter((event) =>
    Object.keys(event.tags).some((tag) =>
      filters.some((filter) => filter === tag)
    )
  );
}

export function validateEventQuery(newQuery: string) {
  if (
    newQuery.length <= EVENT_QUERY_LENGTH_CONSTRAINTS[0] ||
    newQuery.length >= EVENT_QUERY_LENGTH_CONSTRAINTS[1]
  )
    return false;
  return true;
}

export function stringifyEventValue(event: EventType, key: keyof EventType) {
  let result = "-";

  if (event[key]) result = String(event[key]);

  if (key === "startDate" || key === "endDate")
    result = strDateTime(new Date(event[key] ?? 0));

  if (key === "tags") result = Object.keys(event[key]).join(", ");

  return result;
}

export function compareEventValues(before: EventType, after: EventType) {
  const pairs: [keyof EventType, UpdateNameType][] = [
    ["description", "update-description"],
    ["startDate", "update-start-date"],
    ["endDate", "update-end-date"],
    ["location", "update-location"],
    ["organizer", "update-organizer"],
    ["tags", "update-tags"],
    ["name", "update-title"],
    ["thumbnailSrc", "update-thumbnail"],
  ];

  const updates: Partial<Record<UpdateNameType, UpdateChangedValueType>> = {};

  pairs.forEach(([key, UpdateChangesType]) => {
    const sameTags = Object.keys(before["tags"]).some((tag) =>
      Object.keys(after["tags"]).includes(tag)
    );

    if ((key === "tags" && !sameTags) || before[key] !== after[key]) {
      updates[UpdateChangesType] = {
        valuePrevious: stringifyEventValue(before, key),
        valueNew: stringifyEventValue(after, key),
      };

      if (before[key] === "" || !before[key]) {
        updates[UpdateChangesType] = {
          ...updates[UpdateChangesType],
          valuePrevious: "-",
        };
      }

      if (after[key] === "" || !after[key]) {
        updates[UpdateChangesType] = {
          ...updates[UpdateChangesType],
          valueNew: "-",
        };
      }
    }
  });

  return updates;
}

export async function getEvents(
  queryConstraints: QueryConstraint[]
): Promise<EventType[]> {
  return readData(FIREBASE_COLLECTION_EVENTS, queryConstraints);
}

export async function getEventsMonthly(
  month: number,
  year: number
): Promise<EventType[]> {
  const firstDayOfTheMonth = new Date(year, month, 1, 0, 0, 0);
  const lastDayOfTheMonth = new Date(year, month + 1, 1, 0, 0, 0);

  return readData(FIREBASE_COLLECTION_EVENTS, [
    where("startDate", ">=", firstDayOfTheMonth.getTime()),
    where("startDate", "<", lastDayOfTheMonth.getTime()),
  ]);
}

export async function getFollowedEvents(
  userId: string
): Promise<(EventType | undefined)[]> {
  const subscribedEventIds: Record<string, number> = userId
    ? await readData(FIREBASE_COLLECTION_USERS, userId)
        .then((res) => res?.subscribedEvents || {})
        .catch((e) => ({}))
    : JSON.parse(localStorage.getItem("subscribe") ?? "{}");

  return Promise.all(
    Object.keys(subscribedEventIds).map((eventId) =>
      readData(FIREBASE_COLLECTION_EVENTS, eventId)
    )
  );
}

export async function createEvent(event: EventType): Promise<void> {
  const eventDefault = {
    id: null,
    authorId: null,
    name: null,
    tags: {},
    organizer: null,
    location: null,
    startDate: null,
    endDate: null,
    description: null,
    postDate: new Date().getTime(),
    lastUpdatedAt: new Date().getTime(),
    guestSubscriberCount: 0,
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
      postDate: new Date().getTime(),
    },
  });

  // create update document
  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_UPDATES,
    operationType: "create",
    documentId: event.id,
    value: {
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
}

export async function updateEvent(
  eventId: string,
  previousValue: EventType,
  newValue: EventType,
  authorId: string
): Promise<EventType> {
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
  if (different) {
    changes["update-description"] = {};
  }

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
      ...(newValue.endDate === undefined
        ? {
            endDate: deleteField(),
          }
        : {}),
      ...(newValue.location === undefined
        ? {
            location: deleteField(),
          }
        : {}),
      ...(newValue.organizer === undefined
        ? {
            organizer: deleteField(),
          }
        : {}),
      version: increment(1),
      lastUpdatedAt: new Date().getTime(),
    },
  });

  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_UPDATES,
    documentId: eventId,
    operationType: "update",
    value: {
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
            version: previousValue.version ? previousValue.version + 1 : 1,
          }));
        }
      );
    } else {
      return {
        ...newValue,
        version: previousValue.version ? previousValue.version + 1 : 1,
      };
    }
  }) as Promise<EventType>;
}

export async function toggleEventSubscription(
  eventId: string,
  eventVersion: number,
  currentlySubscribed: boolean,
  userId?: string
): Promise<void> {
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
      },
    },
  ]);
}

export async function deleteEvent(eventId: string): Promise<void> {
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

  deleteImage(eventId).catch((e) => {
    return null;
  });

  return writeDataBatch(batchOperations);
}

export async function getComments(eventId: string): Promise<CommentType[]> {
  return readData(FIREBASE_COLLECTION_COMMENTS, eventId).then((comments) => {
    return Object.entries(comments ?? {})
      .reduce(
        (
          arr: CommentType[],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          [k, v]: any
        ) => {
          arr.push({ commentId: k, ...v });
          return arr;
        },
        []
      )
      .sort((a, b) => b.postDate - a.postDate) as CommentType[];
  });
}

export async function createComment(
  eventId: string,
  comment: DatabaseCommentType
): Promise<void> {
  const batchOperations: BatchOperationType[] = [];

  // delete event document
  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_COMMENTS,
    operationType: "update-merge",
    documentId: eventId,
    value: comment,
  });

  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_EVENTS,
    documentId: eventId,
    operationType: "update",
    value: {
      commentCount: increment(1),
    },
  });

  return writeDataBatch(batchOperations);
}

export async function deleteComment(
  eventId: string,
  commentId: string
): Promise<void> {
  const batchOperations: BatchOperationType[] = [];

  // delete event document
  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_COMMENTS,
    operationType: "update",
    documentId: eventId,
    value: {
      [commentId]: deleteField(),
    },
  });

  batchOperations.push({
    collectionName: FIREBASE_COLLECTION_EVENTS,
    documentId: eventId,
    operationType: "update",
    value: {
      commentCount: increment(-1),
    },
  });

  return writeDataBatch(batchOperations);
}
