import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { LayoutTemplateCard, PageSearchEventCard } from "@/components";
import { populateEvents } from "@/utils";
import { useIdentification, useScreen, useEvent } from "@/hooks";
import { EventSearchType, ResponsiveStyleType } from "@/types";
import { EVENT_SORT_CRITERIA } from "@/consts";
import { db } from "@/firebase";
import { ref, update } from "firebase/database";

export interface TemplateSearchEventProps {
  viewType?: EventSearchType;
  title: string;
}

export function TemplateSearchEvent({
  viewType,
  title,
}: TemplateSearchEventProps) {
  const {
    filteredEvents,
    getEvents,
    handleUpdateEvent,
    stateFilters,
    stateQuery,
    stateSortBy,
    stateSortDescending,
  } = useEvent({ type: viewType });
  const [filters, setFilters] = stateFilters;
  const [query, setQuery] = stateQuery;
  const [sortBy, setSortBy] = stateSortBy;
  const [sortDescending, setSortDescending] = stateSortDescending;
  const router = useRouter();
  const { type } = useScreen();

  const { stateIdentification } = useIdentification();
  const identification = stateIdentification[0];
  const { user } = identification;
  const queried = useRef(0);
  const viewTypeString = useMemo(() => `query-${viewType}`, [viewType]);

  const handleUpdatePathQueries = useCallback(() => {
    if (queried.current <= 1) return;

    localStorage.setItem(
      viewTypeString,
      JSON.stringify({
        filters,
        query,
        sortBy: sortBy.id,
        sortDescending,
      })
    );
  }, [filters, query, sortBy.id, sortDescending, viewTypeString]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = localStorage.getItem(viewTypeString);

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);

      const parsedFilters = JSON.parse(parsedQuery.filters);

      setFilters(parsedFilters);
      setQuery(parsedQuery.query);
      setSortBy(
        EVENT_SORT_CRITERIA.filter(({ id }) => id === parsedQuery.sortBy)[0]
      );
      setSortDescending(parsedQuery.sortDescending);
    }

    queried.current++;
  }, [setFilters, setQuery, setSortBy, setSortDescending, viewTypeString]);

  useEffect(() => {
    // handleUpdatePathQueries();
  }, [handleUpdatePathQueries]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  useEffect(() => {
    // handleGetPathQuery();
  }, [handleGetPathQuery]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePopulateDatabaseEvents = useCallback(async () => {
    if (!user || !user.uid) return;

    const samples = populateEvents(40, "admin");

    const updates: Record<string, unknown> = {};
    for (const sample of samples) {
      updates[`/events/${sample.id}`] = sample;
    }

    await update(ref(db), updates);
  }, [user]);

  return (
    <LayoutTemplateCard
      title={title}
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      <PageSearchEventCard
        className="PageSearchEventCard !bg-sky-50 p-4 !pb-0 !h-full"
        events={filteredEvents}
        type={type}
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSortBy={stateSortBy}
        stateSortDescending={stateSortDescending}
        updateEvent={handleUpdateEvent}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10 !pb-0",
  desktop_sm: "!px-10 !pb-0",
  mobile: "",
};
