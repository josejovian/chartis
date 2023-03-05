import { EVENT_DUMMY_1, EVENT_QUERY_LENGTH_CONSTRAINTS } from "@/consts";
import { EventType } from "@/types";

export function filterEventsFromTags(
  events: EventType[],
  filters: Record<number, boolean>
) {
  return events.filter((event) =>
    event.tags.some((tag) =>
      Object.entries(filters).some(
        ([key, value]) => value && Number(key) === tag
      )
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
    today.setMonth(today.getMonth() - 2);
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
    newEvent.tags = [seed % 4];
    newEvent.postDate = today.getTime();
    newEvent.description = "lorem ipsum consectetur adi piscing"
      .split("")
      .sort((a, b) => Math.random() - 0.5)
      .join("");
    delete newEvent.endDate;
    newEvent.subscriberCount = 0;
    newEvent.guestSubscriberCount = 0;
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
