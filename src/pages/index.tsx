import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHomeSideBar, LayoutCalendar, LayoutTemplate } from "@/components";
import { useEvent } from "@/hooks";
import { filterEventsFromTags, getDateMonthYear } from "@/utils";

export default function Home() {
  const stateFocusDate = useState(getDateMonthYear(new Date()));
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];
  const stateShowHidden = useState(false);
  const showHidden = stateShowHidden[0];

  const {
    stateEvents,
    stateFilters,
    getEventsMonthly,
    handleUpdateEvent,
    hiddenEventCount,
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
        stateFilters={stateFilters}
        events={displayedEvents}
        stateShowHidden={stateShowHidden}
        hiddenCount={hiddenEventCount}
      />
    ),
    [
      displayedEvents,
      hiddenEventCount,
      stateFilters,
      stateFocusDate,
      stateShowHidden,
    ]
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
    getEventsMonthly(focusDate.month, focusDate.year, showHidden);
  }, [focusDate.month, focusDate.year, getEventsMonthly, showHidden]);

  useEffect(() => {
    handlePopulateCalendar();
  }, [handlePopulateCalendar]);

  return (
    <LayoutTemplate title="Home" side={renderSidebar} classNameMain="!bg-white">
      {renderCalendar}
    </LayoutTemplate>
  );
}
