import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHomeSideBar, LayoutCalendar, LayoutTemplate } from "@/components";
import { useIdentification, useToast } from "@/hooks";
import { getDateMonthYear, getEventsMonthly } from "@/utils";
import { EventTagNameType, EventType } from "@/types";
import { useEventsObject } from "@/hooks/useEventsObject";

export default function HomePage() {
  const stateFocusDate = useState(getDateMonthYear(new Date()));
  const stateSideBar = useState(false);
  const focusDate = stateFocusDate[0];
  const stateShowHidden = useState(false);
  const showHidden = stateShowHidden[0];
  const [hiddenCount, setHiddenCount] = useState(0);
  const {
    eventsArray,
    stateSubscribedIds,
    updateClientSideEvent,
    setEventsObjectFromArray,
    deleteClientSideEvent,
    updateUserSubscribedEventClientSide,
  } = useEventsObject();
  const subscribedIds = stateSubscribedIds[0];
  const stateFilters = useState<EventTagNameType[]>([]);
  const [filters] = stateFilters;
  const { addToastPreset } = useToast();
  const { stateIdentification } = useIdentification();
  const identification = stateIdentification[0];

  const displayedCalendarEvents = useMemo((): Record<number, EventType[]> => {
    const calendarEvents: Record<number, EventType[]> = {};

    const filteredEvents = eventsArray.filter((event) =>
      Object.keys(event.tags).some(
        (tag) => filters.length < 1 || filters.some((filter) => filter === tag)
      )
    );

    const visibleEvents = filteredEvents.filter(
      (event) => !event.hide || showHidden
    );

    setHiddenCount(filteredEvents.filter((event) => event.hide).length);

    // build default values {1:[], 2:[], ..., 31:[]}
    for (
      let date = 1;
      date <= new Date(focusDate.year, focusDate.month + 1, 0).getDate();
      date++
    ) {
      calendarEvents[date] = [];
    }

    visibleEvents.forEach((event) => {
      const eventStartDate = new Date(event.startDate);
      if (
        focusDate.year === eventStartDate.getFullYear() &&
        focusDate.month === eventStartDate.getMonth()
      )
        calendarEvents[new Date(event.startDate).getDate()].push(event);
    });

    return calendarEvents;
  }, [eventsArray, filters, showHidden, focusDate.year, focusDate.month]);

  const renderSidebar = useMemo(
    () => (
      <PageHomeSideBar
        focusDate={focusDate}
        identification={identification}
        events={displayedCalendarEvents[focusDate.day]}
        subscribedIds={subscribedIds}
        updateClientSideEvent={updateClientSideEvent}
        updateUserSubscribedEventClientSide={
          updateUserSubscribedEventClientSide
        }
        stateSideBar={stateSideBar}
        extraDeleteHandler={deleteClientSideEvent}
      />
    ),
    [
      deleteClientSideEvent,
      displayedCalendarEvents,
      focusDate,
      identification,
      stateSideBar,
      subscribedIds,
      updateClientSideEvent,
      updateUserSubscribedEventClientSide,
    ]
  );

  const handlePopulateCalendar = useCallback(() => {
    getEventsMonthly(focusDate.month, focusDate.year)
      .then((events) => {
        setEventsObjectFromArray(events);
      })
      .catch(() => {
        addToastPreset("fail-get");
      });
  }, [
    addToastPreset,
    focusDate.month,
    focusDate.year,
    setEventsObjectFromArray,
  ]);

  useEffect(() => {
    handlePopulateCalendar();
  }, [handlePopulateCalendar]);

  return (
    <LayoutTemplate
      title="Home"
      htmlTitle=""
      classNameMain="!bg-white"
      side={renderSidebar}
    >
      <LayoutCalendar
        stateShowHidden={stateShowHidden}
        stateFocusDate={stateFocusDate}
        stateFilters={stateFilters}
        events={displayedCalendarEvents}
        hiddenCount={hiddenCount}
      />
    </LayoutTemplate>
  );
}
