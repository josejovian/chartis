import clsx from "clsx";
import {
  EventButtonFilter,
  EventButtonSort,
  EventButtonSortType,
  PageSearchEventInput,
} from "@/components";
import { EventSortType, ScreenSizeCategoryType, StateObject } from "@/types";

export interface PageSearchEventHeadProps {
  stateQuery: StateObject<string>;
  stateFilters: StateObject<Record<number, boolean>>;
  stateSortBy: StateObject<EventSortType>;
  stateSortDescending: StateObject<boolean>;
  type?: ScreenSizeCategoryType;
}

export function PageSearchEventCardHead({
  type,
  stateQuery,
  stateFilters,
  stateSortBy,
  stateSortDescending,
}: PageSearchEventHeadProps) {
  return (
    <div
      className={clsx(
        "flex gap-4 pl-4 pr-4",
        type === "mobile" ? "flex-col" : "flex-row"
      )}
    >
      <PageSearchEventInput stateQuery={stateQuery} />
      <div className="flex grow-0 gap-4 justify-end">
        <EventButtonFilter
          stateFilters={stateFilters}
          asButton
          size={type === "mobile" ? "tiny" : undefined}
        />
        <EventButtonSort
          stateSortBy={stateSortBy}
          size={type === "mobile" ? "tiny" : undefined}
        />
        <EventButtonSortType
          stateSortDescending={stateSortDescending}
          size={type === "mobile" ? "tiny" : undefined}
        />
      </div>
    </div>
  );
}
