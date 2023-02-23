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

export function populateEvents() {
  const randomEventsId: Record<number, boolean> = {};
  let temp: EventType[] = [];
  for (let i = 0; i < 100; i++) {
    let seed = Math.floor(Math.random() * 100000 * i) % 5000;
    while (randomEventsId[seed]) {
      seed = Math.floor(Math.random() * 100000 * i) % 5000;
    }
    randomEventsId[seed] = true;

    const today = new Date();
    today.setDate(seed % 27);
    today.setHours(seed % 24);
    today.setMinutes(seed % 59);
    today.setSeconds(0);

    const newEvent = {
      ...EVENT_DUMMY_1,
    };
    newEvent.id = `${Math.floor(seed)}`;
    newEvent.startDate = today.getTime();
    newEvent.name = `Event #${seed}`;
    newEvent.endDate = undefined;
    newEvent.tags = [seed % 4];
    newEvent.postDate = today.getTime();
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
