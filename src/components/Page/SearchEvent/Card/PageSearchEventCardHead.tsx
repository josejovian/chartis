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
  stateQuery,
  stateFilters,
  stateSortBy,
  stateSortDescending,
}: PageSearchEventHeadProps) {
  return (
    <div className="flex gap-4 pl-4">
      <PageSearchEventInput stateQuery={stateQuery} />
      <div className="flex grow-0 gap-4">
        <EventButtonFilter stateFilters={stateFilters} asButton />
        <EventButtonSort stateSortBy={stateSortBy} />
        <EventButtonSortType stateSortDescending={stateSortDescending} />
      </div>
    </div>
  );
}
