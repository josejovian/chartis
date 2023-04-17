import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PageHomeSideBar,
  LayoutCalendar,
  LayoutTemplate,
  EventButtonFilter,
} from "@/components";
import { useEvent } from "@/hooks";
import { filterEventsFromTags, getDateMonthYear } from "@/utils";

export default function Home() {
  const stateFocusDate = useState(getDateMonthYear(new Date()));
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];

  const {
    stateEvents,
    stateFilters,
    handleFetchEventsInOneMonthPage,
    handleUpdateEvent,
  } = useEvent({});

  const events = stateEvents[0];

  const filters = stateFilters[0];
  const atLeastOneFilter = useMemo(() => filters.length > 0, [filters.length]);

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
            date.getDate() === focusDate.day &&
            date.getMonth() === focusDate.month
          );
        })}
        stateSideBar={stateSideBar}
        updateEvent={handleUpdateEvent}
      />
    ),
    [displayedEvents, focusDate, handleUpdateEvent, stateSideBar]
  );

  const handlePopulateCalendar = useCallback(() => {
    handleFetchEventsInOneMonthPage(focusDate.month, focusDate.year);
  }, [focusDate.month, focusDate.year, handleFetchEventsInOneMonthPage]);

  useEffect(() => {
    handlePopulateCalendar();
  }, [handlePopulateCalendar]);

  return (
    <LayoutTemplate
      title="Home"
      rightElement={<EventButtonFilter stateFilters={stateFilters} />}
      side={renderSidebar}
      classNameMain="!bg-white"
    >
      {renderCalendar}
    </LayoutTemplate>
  );
}
