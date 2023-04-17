import {
  EVENT_DUMMY_1,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  EVENT_TAGS,
} from "@/consts";
import { EventTagNameType, EventType } from "@/types";

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
