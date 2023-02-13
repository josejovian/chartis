import { useMemo } from "react";
import { Dropdown, Icon, Label } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_TAGS } from "@/consts";
import { StateObject } from "@/types";

export interface LayoutCalendarFilterProps {
  stateFilters: StateObject<Record<number, boolean>>;
  visibleFilters: Record<number, boolean>;
}

export function ScreenHomeCalendarFilter({
  stateFilters,
  visibleFilters,
}: LayoutCalendarFilterProps) {
  const [filters, setFilters] = stateFilters;

  const renderDropdownItems = useMemo(
    () =>
      EVENT_TAGS.map((tag, idx) => ({
        ...tag,
        idx,
      }))
        .filter((tag) => visibleFilters[tag.idx])
        .map((tag) => {
          const { color, name, idx } = tag;
          return (
            <Dropdown.Item
              key={name}
              value={name}
              label={{
                color,
                empty: true,
                circular: true,
              }}
              className={clsx(filters[idx] && "bg-secondary-3")}
              onClick={() => {
                setFilters((prev) => ({
                  ...prev,
                  [idx]: !prev[idx],
                }));
              }}
            >
              <Label color={color} circular empty />
              <span>{name}</span>
            </Dropdown.Item>
          );
        }),
    [filters, setFilters, visibleFilters]
  );

  return (
    <Dropdown
      text="Filter"
      icon="filter"
      className="icon"
      labeled
      floating
      button
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>
          <Dropdown.Item
            key="_all"
            value="_all"
            disabled={Object.values(filters).filter((x) => x).length === 0}
            onClick={() => {
              setFilters(EVENT_TAGS.map((_) => false));
            }}
          >
            <Icon name="close" />
            <span>Clear Filter</span>
          </Dropdown.Item>
          {renderDropdownItems}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
