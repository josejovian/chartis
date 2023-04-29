import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_TAGS } from "@/consts";
import { EventTagNameType, EventTagType, StateObject } from "@/types";
import { ButtonDropdownSelect } from "@/components/Button";

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
