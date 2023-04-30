import { type SemanticSIZES } from "semantic-ui-react";
import { ButtonDropdownSelect } from "@/components";
import { EVENT_TAGS } from "@/consts";
import { EventTagNameType, StateObject } from "@/types";

export interface EventButtonFilterProps {
  stateFilters: StateObject<EventTagNameType[]>;
  size?: SemanticSIZES;
}

export function EventButtonFilter({
  stateFilters,
  size,
}: EventButtonFilterProps) {
  return (
    <ButtonDropdownSelect
      name="Filter"
      stateActive={stateFilters}
      options={EVENT_TAGS}
      size={size}
      type="multiple"
    />
  );
}
