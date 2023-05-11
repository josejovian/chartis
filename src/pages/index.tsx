import { useEffect, useMemo, useState } from "react";
import { PageHomeSideBar, LayoutCalendar, LayoutTemplate } from "@/components";
import { useEvent, useToast } from "@/hooks";
import { getDateMonthYear } from "@/utils";
import { EventTagNameType, EventType } from "@/types";

export default function Home() {
  const stateFocusDate = useState(getDateMonthYear(new Date()));
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];
  const stateShowHidden = useState(false);
  const showHidden = stateShowHidden[0];
  const [events, setEvents] = useState<EventType[]>([]);
  const stateFilters = useState<EventTagNameType[]>([]);
  const [filters] = stateFilters;
  const { addToastPreset } = useToast();

  const { getEventsMonthly, updateEvent } = useEvent();

  const displayedCalendarEvents = useMemo((): Record<number, EventType[]> => {
    const calendarEvents: Record<number, EventType[]> = {};

    const filteredEvents = events.filter((event) =>
      Object.keys(event.tags).some(
        (tag) => filters.length < 1 || filters.some((filter) => filter === tag)
      )
    );

    const visibleEvents = filteredEvents.filter((event) =>
      event.hide && showHidden ? false : true
    );

    // build default values {1:[], 2:[], ..., 31:[]}
    for (
      let date = 1;
      date <= new Date(focusDate.year, focusDate.month + 1, 0).getDate();
      date++
    ) {
      calendarEvents[date] = [];
    }

    visibleEvents.forEach((event) => {
      calendarEvents[new Date(event.startDate).getDate()].push(event);
    });

    return calendarEvents;
  }, [events, filters, focusDate.month, focusDate.year, showHidden]);

  const renderSidebar = useMemo(
    () => (
      <PageHomeSideBar
        focusDate={focusDate}
        events={displayedCalendarEvents[focusDate.day]}
        stateSideBar={stateSideBar}
        updateEvent={() => updateEvent}
      />
    ),
    [displayedCalendarEvents, focusDate, stateSideBar, updateEvent]
  );

  useEffect(() => {
    getEventsMonthly(focusDate.month, focusDate.year)
      .then((events) => {
        setEvents(events);
      })
      .catch(() => {
        addToastPreset("fail-get");
      });
  }, [addToastPreset, focusDate.month, focusDate.year, getEventsMonthly]);

  return (
    <LayoutTemplate title="Home" classNameMain="!bg-white" side={renderSidebar}>
      <LayoutCalendar
        stateShowHidden={stateShowHidden}
        stateFocusDate={stateFocusDate}
        stateFilters={stateFilters}
        events={displayedCalendarEvents}
      />
    </LayoutTemplate>
  );
}
