import {
  EventCard,
  LayoutCard,
  LayoutNotice,
  PageSearchEventCardHead,
} from "@/components";
import {
  EventSortType,
  EventTagNameType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { useMemo } from "react";
import clsx from "clsx";
import { useIdentification } from "@/hooks";
import { validateEventQuery } from "@/utils";
import { EVENT_QUERY_LENGTH_CONSTRAINTS } from "@/consts";

export interface PageSearchEventCardProps {
  className?: string;
  events: EventType[];
  type: ScreenSizeCategoryType;
  stateQuery: StateObject<string>;
  stateFilters: StateObject<EventTagNameType[]>;
  stateSortBy: StateObject<EventSortType>;
  stateSortDescending: StateObject<boolean>;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
}

export function PageSearchEventCard({
  className,
  events,
  type,
  stateQuery,
  stateFilters,
  stateSortBy,
  stateSortDescending,
  updateEvent,
}: PageSearchEventCardProps) {
  const query = stateQuery[0];
  const sortBy = stateSortBy[0];
  const sortDescending = stateSortDescending[0];
  const { stateIdentification, updateUserSubscribedEventClientSide } =
    useIdentification();

  const sortCaption = useMemo(
    () =>
      `, sorted by ${sortBy.name} ${
        sortDescending ? "descending" : "ascending"
      }ly.`,
    [sortBy, sortDescending]
  );

  const mainCaption = useMemo(() => `Searching for "${query}" events`, [query]);

  const renderCaption = useMemo(
    () =>
      validateEventQuery(query) && query !== ""
        ? `${mainCaption} ${sortCaption}`
        : `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0]}-${EVENT_QUERY_LENGTH_CONSTRAINTS[1]} characters.`,
    [mainCaption, query, sortCaption]
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
        title={query !== "" ? "It's Empty" : "Start Searching"}
        description={
          query !== ""
            ? "No events found with such query."
            : "Type in any key word."
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
        stateSortBy={stateSortBy}
        stateSortDescending={stateSortDescending}
      />
      <div className="mt-4 mb-6 pl-4">{renderCaption}&nbsp;</div>
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
