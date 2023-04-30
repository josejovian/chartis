import clsx from "clsx";
import { PageSearchEventInput } from "@/components";
import {
  EventSortType,
  EventTagNameType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { ButtonDropdownSelect, ButtonDropdownSort } from "@/components/Button";
import { EVENT_SORT_CRITERIA, EVENT_TAGS } from "@/consts";

export interface PageSearchEventHeadProps {
  stateQuery: StateObject<string>;
  stateFilters: StateObject<EventTagNameType[]>;
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
        <ButtonDropdownSelect
          name="Filter"
          stateActive={stateFilters}
          options={EVENT_TAGS}
          size={type === "mobile" ? "tiny" : undefined}
          type="multiple"
        />
        <ButtonDropdownSort
          stateSortBy={stateSortBy}
          stateSortDescending={stateSortDescending}
          size={type === "mobile" ? "tiny" : undefined}
          options={EVENT_SORT_CRITERIA}
        />
      </div>
    </div>
  );
}
