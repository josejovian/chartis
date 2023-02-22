import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PageHomeSideBar,
  LayoutCalendar,
  LayoutTemplate,
  EventButtonFilter,
} from "@/components";
import { filterEventsFromTags, populateEvents } from "@/utils";
import { EVENT_TAGS } from "@/consts";
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
  const visibleFilters = useMemo(
    () =>
      EVENT_TAGS.map(
        (_, idx) => filterEventsFromTags(events, { [idx]: true }).length > 0
      ),
    [events]
  );
  const displayedEvents = useMemo(
    () => (atLeastOneFilter ? filterEventsFromTags(events, filters) : events),
    [atLeastOneFilter, events, filters]
  );

  const handlePopulateRandomEvents = useCallback(() => {
    setEvents(populateEvents());
  }, []);

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
