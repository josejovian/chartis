/* eslint-disable @typescript-eslint/no-unused-vars */
import { Input } from "semantic-ui-react";
import { EventButtonFilter } from "@/components";
import { ScreenSizeCategoryType, StateObject } from "@/types";

export interface PageSearchEventHeadProps {
  stateFilters: StateObject<Record<number, boolean>>;
  type?: ScreenSizeCategoryType;
}

export function PageSearchEventHead({
  stateFilters,
  type,
}: PageSearchEventHeadProps) {
  const filters = stateFilters[0];

  return (
    <div className="flex">
      <Input placeholder="Search events..." />
      <EventButtonFilter stateFilters={stateFilters} asButton />
    </div>
  );
}
