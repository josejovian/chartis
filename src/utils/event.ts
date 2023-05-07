import {
  EVENT_DUMMY_1,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  EVENT_TAGS,
} from "@/consts";
import {
  EventTagNameType,
  EventType,
  UpdateNameType,
  UpdateChangedValueType,
} from "@/types";
import { strDateTime } from "./date";

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

// FOR DELETION: function to populate the database with dummy events
export function populateEvents(count: number, authorId: string) {
  const randomEventsId: Record<number, boolean> = {};
  let temp: EventType[] = [];

  for (let i = 0; i < Math.max(Math.min(50, count), 10); i++) {
    let seed = Math.floor(Math.random() * 100000 * i) % 5000;
    while (randomEventsId[seed]) {
      seed = Math.floor(Math.random() * 100000 * i) % 5000;
    }
    randomEventsId[seed] = true;

    const today = new Date();
    today.setMonth(today.getMonth());
    today.setDate(seed % 27);
    today.setHours(seed % 24);
    today.setMinutes(seed % 59);
    today.setSeconds(0);

    const newEvent = {
      ...EVENT_DUMMY_1,
    };
    newEvent.id = `-Dummy${Math.floor(seed)}`;
    newEvent.authorId = authorId;
    newEvent.startDate = today.getTime();
    newEvent.name = `Event #${seed}`;
    newEvent.endDate = undefined;
    newEvent.tags = {
      [Object.keys(EVENT_TAGS)[seed % Object.keys(EVENT_TAGS).length]]: true,
    };

    if (seed % 3 === 0) {
      newEvent.tags = {
        ...newEvent.tags,
        [Object.keys(EVENT_TAGS)[(seed + 1) % Object.keys(EVENT_TAGS).length]]:
          true,
      };
    }

    newEvent.postDate = today.getTime();
    newEvent.description =
      "lorem ipsum consectetur adi piscing ipsum consectetur adi piscing"
        .split("")
        .sort((a, b) => Math.random() - 0.5)
        .join("");
    delete newEvent.endDate;
    newEvent.subscriberCount = seed % 1000;
    newEvent.guestSubscriberCount = seed % 1000;
    newEvent.subscriberIds = [];
    temp = [...temp, newEvent];
  }

  temp = temp.sort((a, b) => a.startDate - b.startDate);
  return temp;
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
    }
  });

  return updates;
}
