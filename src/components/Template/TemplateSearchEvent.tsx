import { useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { LayoutTemplateCard, PageSearchEventCard } from "@/components";
import { EventSearchType, ResponsiveStyleType } from "@/types";
import { useEvent, useScreen } from "@/hooks";
import clsx from "clsx";

export interface TemplateSearchEventProps {
  noWrapper?: boolean;
  className?: string;
  viewType?: EventSearchType;
  title: string;
}

export function TemplateSearchEvent({
  noWrapper,
  className,
  viewType,
  title,
}: TemplateSearchEventProps) {
  const {
    filteredEvents,
    getEvents,
    handleUpdateEvent,
    stateFilters,
    stateQuery,
    stateSort,
  } = useEvent({ type: viewType });
  const [filters, setFilters] = stateFilters;
  const [query, setQuery] = stateQuery;
  const [sort, setSort] = stateSort;
  const router = useRouter();
  const { type } = useScreen();

  const queried = useRef(0);
  const viewTypeString = useMemo(() => `query-${viewType}`, [viewType]);

  const handleUpdatePathQueries = useCallback(() => {
    if (queried.current <= 1) return;

    sessionStorage.setItem(
      viewTypeString,
      JSON.stringify({
        filters,
        query,
        sort,
      })
    );
  }, [filters, query, sort, viewTypeString]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = sessionStorage.getItem(viewTypeString);

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);

      const parsedFilters = parsedQuery.filters;

      setFilters(parsedFilters);
      setQuery(parsedQuery.query);
      setSort(parsedQuery.sort);
    }

    queried.current++;
  }, [setFilters, setQuery, setSort, viewTypeString]);

  useEffect(() => {
    handleUpdatePathQueries();
  }, [stateFilters, stateQuery, stateSort, handleUpdatePathQueries]);

  useEffect(() => {
    handleGetPathQuery();
  }, [handleGetPathQuery]);

  useEffect(() => {
    getEvents();
  }, [getEvents]);

  const renderSearcher = useMemo(
    () => (
      <PageSearchEventCard
        className={clsx(
          "PageSearchEventCard !bg-sky-50 p-4 !pb-0 !h-full",
          className
        )}
        events={filteredEvents}
        type={type}
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSort={stateSort}
        updateEvent={handleUpdateEvent}
      />
    ),
    [
      className,
      filteredEvents,
      handleUpdateEvent,
      stateFilters,
      stateQuery,
      stateSort,
      type,
    ]
  );

  return noWrapper ? (
    renderSearcher
  ) : (
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
      {renderSearcher}
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10 !pb-0",
  desktop_sm: "!px-10 !pb-0",
  mobile: "",
};
