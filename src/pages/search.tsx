import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { LayoutTemplateCard } from "@/components";
import { PageSearchEventCard } from "@/components/Page/SearchEvent";
import { EVENT_SORT_CRITERIA, EVENT_TAGS } from "@/consts";
import { EventSortType, ResponsiveStyleType } from "@/types";
import { filterEventsFromTags, populateEvents } from "@/utils";
import { useScreen } from "@/hooks";

export default function SearchEvent() {
  const { type } = useScreen();
  const stateFilters = useState<Record<number, boolean>>(
    EVENT_TAGS.map((_) => false)
  );
  const filters = stateFilters[0];
  const atLeastOneFilter = useMemo(
    () => Object.values(stateFilters[0]).some((f) => f),
    [stateFilters]
  );
  const stateSortBy = useState<EventSortType>(EVENT_SORT_CRITERIA[0]);
  const sortBy = stateSortBy[0];
  const stateSortDescending = useState(false);
  const sortDescending = stateSortDescending[0];
  const stateQuery = useState("");
  const query = stateQuery[0];

  const router = useRouter();

  const events = useMemo(
    () =>
      query === ""
        ? []
        : atLeastOneFilter
        ? filterEventsFromTags(populateEvents(), filters)
        : populateEvents(),
    [atLeastOneFilter, filters, query]
  );

  const processedEvents = useMemo(
    () =>
      events
        .filter(({ name }) => {
          const reg = new RegExp(_.escapeRegExp(query), "i");
          return reg.test(name);
        })
        .sort((a, b) => {
          const left = a[sortBy.id];
          const right = b[sortBy.id];
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortDescending ? -1 : 1);
          return 0;
        }),
    [events, query, sortBy, sortDescending]
  );

  return (
    <LayoutTemplateCard
      title="Search"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      <PageSearchEventCard
        className="PageSearchEventCard !bg-sky-50 p-4 !h-screen"
        events={processedEvents}
        type={type}
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSortBy={stateSortBy}
        stateSortDescending={stateSortDescending}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10",
  desktop_sm: "!px-10",
  mobile: "",
};
