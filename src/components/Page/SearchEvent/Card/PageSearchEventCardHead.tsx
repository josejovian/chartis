import clsx from "clsx";
import {
  EventSortNameType,
  EventTagNameType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { ButtonDropdownSelect } from "@/components/Button";
import { EVENT_SORT_CRITERIA, EVENT_TAGS } from "@/consts";

export interface PageSearchEventHeadProps {
  stateQuery: StateObject<string>;
  stateFilters: StateObject<EventTagNameType[]>;
  stateSort: StateObject<EventSortNameType>;
  type?: ScreenSizeCategoryType;
}

export function PageSearchEventCardHead({
  type,
  stateQuery,
  stateFilters,
  stateSort,
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
        <ButtonDropdownSelect
          name="Sort"
          stateActive={stateSort}
          options={EVENT_SORT_CRITERIA}
          size={type === "mobile" ? "tiny" : undefined}
          type="single"
        />
      </div>
    </div>
  );
}
