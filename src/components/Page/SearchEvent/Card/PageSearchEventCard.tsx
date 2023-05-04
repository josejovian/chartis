import {
  EventCard,
  LayoutCard,
  LayoutNotice,
  PageSearchEventCardHead,
} from "@/components";
import {
  EventSortNameType,
  EventTagNameType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { useMemo } from "react";
import clsx from "clsx";
import { useIdentification } from "@/hooks";
import { validateEventQuery } from "@/utils";
import {
  ASSET_CALENDAR,
  ASSET_NO_CONTENT,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  EVENT_SORT_CRITERIA,
} from "@/consts";

export interface PageSearchEventCardProps {
  className?: string;
  events: EventType[];
  type: ScreenSizeCategoryType;
  stateQuery: StateObject<string>;
  stateFilters: StateObject<EventTagNameType[]>;
  stateSort: StateObject<EventSortNameType>;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
}

export function PageSearchEventCard({
  className,
  events,
  type,
  stateQuery,
  stateFilters,
  stateSort,
  updateEvent,
}: PageSearchEventCardProps) {
  const query = stateQuery[0];
  const sort = stateSort[0];
  const sortBy = useMemo(() => EVENT_SORT_CRITERIA[sort], [sort]);
  const filters = stateFilters[0];
  const { stateIdentification, updateUserSubscribedEventClientSide } =
    useIdentification();

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
      events.map((event) => (
        <EventCard
          key={`PageSearchEventCard_${event.id}`}
          type={type === "mobile" ? "vertical" : "horizontal"}
          event={event}
          stateIdentification={stateIdentification}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
          updateEvent={updateEvent}
        />
      )),
    [
      events,
      stateIdentification,
      type,
      updateEvent,
      updateUserSubscribedEventClientSide,
    ]
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
    () => (events.length > 0 ? renderEvents : renderEmpty),
    [events.length, renderEmpty, renderEvents]
  );

  return (
    <LayoutCard className={className}>
      <PageSearchEventCardHead
        type={type}
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSort={stateSort}
      />
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
