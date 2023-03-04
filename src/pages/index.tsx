import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PageHomeSideBar,
  LayoutCalendar,
  LayoutTemplate,
  EventButtonFilter,
} from "@/components";
import { useSearchEvent } from "@/hooks";
import { filterEventsFromTags } from "@/utils";
import { EVENT_TAGS } from "@/consts";

export default function Home() {
  const stateFocusDate = useState(new Date());
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];

  const { stateEvents, handleFetchEvents, handleUpdateEvent } = useSearchEvent(
    {}
  );

  const [events, setEvents] = stateEvents;

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
        updateEvent={handleUpdateEvent}
      />
    ),
    [displayedEvents, focusDate, handleUpdateEvent, stateSideBar]
  );

  const handlePopulateCalendar = useCallback(() => {
    handleFetchEvents((result) => setEvents(result));
  }, [handleFetchEvents, setEvents]);

  useEffect(() => {
    handlePopulateCalendar();
  }, [handlePopulateCalendar]);

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
