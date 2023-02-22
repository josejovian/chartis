import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PageHomeSideBar,
  LayoutCalendar,
  LayoutTemplate,
  EventButtonFilter,
} from "@/components";
import { filterEventsFromTags } from "@/utils";
import { EVENT_DUMMY_1, EVENT_TAGS } from "@/consts";
import { EventType } from "@/types";

export default function Home() {
  const stateFocusDate = useState(new Date());
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];

  const [events, setEvents] = useState<EventType[]>([]);
  const stateFilters = useState<Record<number, boolean>>(
    EVENT_TAGS.map((_) => false)
  );
  const filters = stateFilters[0];

  const atLeastOneFilter = useMemo(
    () => Object.values(stateFilters[0]).some((f) => f),
    [stateFilters]
  );
  const displayedEvents = useMemo(
    () => (atLeastOneFilter ? filterEventsFromTags(events, filters) : events),
    [atLeastOneFilter, events, filters]
  );

  const randomEventsId = useRef<Record<string, boolean>>({});

  const handlePopulateRandomEvents = useCallback(() => {
    let temp: EventType[] = [];
    for (let i = 0; i < 100; i++) {
      let seed = Math.floor(Math.random() * 100000 * i) % 5000;
      while (randomEventsId.current[seed]) {
        seed = Math.floor(Math.random() * 100000 * i) % 5000;
      }
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
      temp = [...temp, newEvent];
    }

    temp = temp.sort((a, b) => a.startDate - b.startDate);
    setEvents(temp);
  }, []);

  const visibleFilters = useMemo(
    () =>
      EVENT_TAGS.map(
        (_, idx) => filterEventsFromTags(events, { [idx]: true }).length > 0
      ),
    [events]
  );

  const renderCalendar = useMemo(
    () => (
      <LayoutCalendar
        stateFocusDate={stateFocusDate}
        events={displayedEvents}
      />
    ),
    [displayedEvents, stateFocusDate]
  );

  const renderSidebar = useMemo(
    () => (
      <PageHomeSideBar
        focusDate={focusDate}
        events={displayedEvents.filter((event) => {
          const date = new Date(event.startDate);
          return (
            date.getDate() === focusDate.getDate() &&
            date.getMonth() === focusDate.getMonth()
          );
        })}
        stateSideBar={stateSideBar}
      />
    ),
    [displayedEvents, focusDate, stateSideBar]
  );

  useEffect(() => {
    handlePopulateRandomEvents();
  }, [handlePopulateRandomEvents]);

  return (
    <LayoutTemplate
      title="Home"
      rightElement={
        <EventButtonFilter
          stateFilters={stateFilters}
          visibleFilters={visibleFilters}
        />
      }
      side={renderSidebar}
      classNameMain="!bg-white"
    >
      {renderCalendar}
    </LayoutTemplate>
  );
}
