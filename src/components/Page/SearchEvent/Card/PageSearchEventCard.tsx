import {
  ButtonDropdownSelect,
  EventCard,
  LayoutCard,
  LayoutNotice,
  TemplateSearchInput,
} from "@/components";
import {
  EventSearchType,
  EventSortNameType,
  EventTagNameType,
  EventType,
  ScreenSizeCategoryType,
} from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useEvent, useIdentification, useToast } from "@/hooks";
import { validateEventQuery } from "@/utils";
import {
  ASSET_CALENDAR,
  ASSET_NO_CONTENT,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  EVENT_SORT_CRITERIA,
  EVENT_TAGS,
} from "@/consts";
import { where } from "firebase/firestore";
import { useRouter } from "next/router";

export interface PageSearchEventCardProps {
  viewType?: EventSearchType;
  className?: string;
  userId?: string;
  type: ScreenSizeCategoryType;
}

export function PageSearchEventCard({
  viewType,
  className,
  type,
}: PageSearchEventCardProps) {
  const stateEvents = useState<EventType[]>([]);
  const [events, setEvents] = stateEvents;
  const { getEvents, getFollowedEvents } = useEvent();
  const stateFilters = useState<EventTagNameType[]>([]);
  const [filters] = stateFilters;
  const stateQuery = useState("");
  const [query] = stateQuery;
  const stateSort = useState<EventSortNameType>("newest");
  const [sort] = stateSort;
  const { addToastPreset } = useToast();
  const sortBy = useMemo(() => EVENT_SORT_CRITERIA[sort], [sort]);
  const { updateUserSubscribedEventClientSide } = useIdentification();
  const router = useRouter();
  const { id: authorId } = router.query;
  const queried = useRef(0);

  const sortEvents = useCallback(
    (events: EventType[]): EventType[] => {
      const { key, descending } = sortBy;
      let eventArray = [] as EventType[];
      const isDescending = descending ? 1 : -1;
      eventArray = events.sort((a, b) => {
        const left = a[key] ?? 0;
        const right = b[key] ?? 0;
        if (
          (typeof left === "number" && typeof right === "number") ||
          (typeof left === "string" && typeof right === "string")
        )
          if (left > right) {
            return -1 * isDescending;
          }
        if (right > left) {
          return 1 * isDescending;
        }
        return 0;
      });

      return eventArray;
    },
    [sortBy]
  );

  const displayedEvents = useMemo(() => {
    const queriedEvents: EventType[] = [];

    if (queried && query) {
      queriedEvents.push(
        ...events.filter((event) =>
          event.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      queriedEvents.push(...events);
    }

    const filteredEvents = events.filter((event) =>
      Object.keys(event.tags).some(
        (tag) => filters.length < 1 || filters.some((filter) => filter === tag)
      )
    );

    const sortedEvents = sortEvents(filteredEvents);

    return sortedEvents;
  }, [events, filters, query, sortEvents]);

  // const handleUpdatePathQueries = useCallback(() => {
  //   if (queried.current <= 1) return;

  //   sessionStorage.setItem(
  //     viewTypeString,
  //     JSON.stringify({
  //       filters,
  //       query,
  //       sort,
  //     })
  //   );
  // }, [filters, query, sort, viewTypeString]);

  // const handleGetPathQuery = useCallback(() => {
  //   const rawQuery = sessionStorage.getItem(viewTypeString);

  //   if (rawQuery && queried.current <= 1) {
  //     const parsedQuery = JSON.parse(rawQuery);

  //     const parsedFilters = parsedQuery.filters;

  //     setFilters(parsedFilters);
  //     setQuery(parsedQuery.query);
  //     setSort(parsedQuery.sort);
  //   }

  //   queried.current++;
  // }, [setFilters, setQuery, setSort, viewTypeString]);

  // useEffect(() => {
  //   handleUpdatePathQueries();
  // }, [handleUpdatePathQueries]);

  // useEffect(() => {
  //   handleGetPathQuery();
  // }, [handleGetPathQuery]);

  useEffect(() => {
    // console.log(viewType);
    // return;
    switch (viewType) {
      case "userCreatedEvents":
        getEvents([where("authorId", "==", authorId)])
          .then((event) => setEvents(event))
          .catch(() => {
            addToastPreset("fail-get");
          });
        break;
      case "userFollowedEvents":
        getFollowedEvents()
          .then((events) => {
            setEvents(
              events.filter((event) => event !== undefined) as EventType[]
            );
          })
          .catch(() => {
            addToastPreset("fail-get");
          });
        break;
      case "default":
        getEvents([]).then((events) => setEvents(events));
        break;
    }
  }, [
    addToastPreset,
    authorId,
    getEvents,
    getFollowedEvents,
    setEvents,
    viewType,
  ]);

  const filterCaption = useMemo(
    () => (
      <>
        &nbsp;that has the tag(s): <b>{filters.join(", ")}</b>
      </>
    ),
    [filters]
  );

  const sortCaption = useMemo(
    () => ` , sorted by ${sortBy.name}.`,
    [sortBy.name]
  );

  const renderCaption = useMemo(
    () => (
      <>
        {!validateEventQuery(query) &&
          `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0]}-${EVENT_QUERY_LENGTH_CONSTRAINTS[1]} characters. `}
        {query !== "" ? (
          <>
            Searching for {query}
            {filters.length > 0 && filterCaption}
          </>
        ) : (
          <>
            Filtering by{" "}
            <b>{filters.length > 0 ? filters.join(", ") : "none"}</b>
          </>
        )}
        {sortCaption}
      </>
    ),
    [filterCaption, filters, query, sortCaption]
  );

  const renderEvents = useMemo(
    () =>
      displayedEvents.map((event) => (
        <EventCard
          key={`PageSearchEventCard_${event.id}`}
          type={type === "mobile" ? "vertical" : "horizontal"}
          event={event}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
        />
      )),
    [displayedEvents, type, updateUserSubscribedEventClientSide]
  );

  const renderEmpty = useMemo(
    () => (
      <LayoutNotice
        illustration={query !== "" ? ASSET_NO_CONTENT : ASSET_CALENDAR}
        title={query !== "" ? "No Events" : "Start Searching"}
        description={
          query !== ""
            ? "No events found with such query."
            : "Select a filter or type in any key word."
        }
      />
    ),
    [query]
  );

  const renderContents = useMemo(
    () => (displayedEvents.length > 0 ? renderEvents : renderEmpty),
    [displayedEvents.length, renderEmpty, renderEvents]
  );

  return (
    <LayoutCard className={className}>
      <div
        className={clsx(
          "flex gap-4 pl-4 pr-4",
          type === "mobile" ? "flex-col" : "flex-row"
        )}
      >
        <TemplateSearchInput
          placeholder="Search events..."
          stateQuery={stateQuery}
        />
        <div className="flex grow-0 gap-4 justify-end">
          <ButtonDropdownSelect
            name="Filter"
            stateActive={stateFilters}
            options={EVENT_TAGS}
            size={type === "mobile" ? "tiny" : undefined}
            type="multiple"
          />
          <ButtonDropdownSelect
            name="Sort"
            stateActive={stateSort}
            options={EVENT_SORT_CRITERIA}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
        </div>
      </div>
      <div className="mt-4 mb-6 pl-4">{renderCaption}</div>
      <div
        className={clsx(
          "flex flex-col gap-4",
          "px-4 mr-4 py-0.5 h-full overflow-y-auto"
        )}
      >
        {renderContents}
      </div>
    </LayoutCard>
  );
}
