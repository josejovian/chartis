import {
  EventCard,
  LayoutCard,
  LayoutNotice,
  PageSearchEventCardHead,
} from "@/components";
import { EventSortType, EventType, StateObject } from "@/types";
import { useMemo } from "react";
import clsx from "clsx";

export interface PageSearchEventCardProps {
  className?: string;
  events: EventType[];
  stateQuery: StateObject<string>;
  stateFilters: StateObject<Record<number, boolean>>;
  stateSortBy: StateObject<EventSortType>;
  stateSortDescending: StateObject<boolean>;
}

export function PageSearchEventCard({
  className,
  events,
  stateQuery,
  stateFilters,
  stateSortBy,
  stateSortDescending,
}: PageSearchEventCardProps) {
  const query = stateQuery[0];
  const sortBy = stateSortBy[0];
  const sortDescending = stateSortDescending[0];

  const sortCaption = useMemo(
    () =>
      `, sorted by ${sortBy.name} ${
        sortDescending ? "descending" : "ascending"
      }ly.`,
    [sortBy, sortDescending]
  );

  const mainCaption = useMemo(() => `Searching for ${query} events`, [query]);

  const renderCaption = useMemo(
    () => query !== "" && `${mainCaption} ${sortCaption}`,
    [mainCaption, query, sortCaption]
  );

  const renderEvents = useMemo(
    () =>
      events.map((event) => (
        <EventCard
          key={`PageSearchEventCard_${event.id}`}
          type="vertical"
          event={event}
        />
      )),
    [events]
  );

  const renderEmpty = useMemo(
    () => (
      <LayoutNotice
        title={query !== "" ? "It's Empty" : "Start Searching"}
        desc={
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
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSortBy={stateSortBy}
        stateSortDescending={stateSortDescending}
      />
      <div className="mt-4 mb-6 pl-4">{renderCaption}&nbsp;</div>
      <div
        className={clsx(
          "flex flex-col gap-4",
          "px-4 py-0.5 h-full overflow-y-auto"
        )}
      >
        {renderContents}
      </div>
    </LayoutCard>
  );
}
