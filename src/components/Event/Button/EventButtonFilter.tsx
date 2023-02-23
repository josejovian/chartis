import { useMemo } from "react";
import {
  Button,
  Dropdown,
  Icon,
  Label,
  SemanticSIZES,
} from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_TAGS } from "@/consts";
import { StateObject } from "@/types";
import { useScreen } from "@/hooks";

export interface EventButtonFilterProps {
  stateFilters: StateObject<Record<number, boolean>>;
  visibleFilters?: Record<number, boolean>;
  asButton?: boolean;
  size?: SemanticSIZES;
}

export function EventButtonFilter({
  stateFilters,
  visibleFilters,
  asButton,
  size,
}: EventButtonFilterProps) {
  const [filters, setFilters] = stateFilters;
  const { type } = useScreen();

  const renderDropdownItems = useMemo(
    () =>
      EVENT_TAGS.map((tag, idx) => ({
        ...tag,
        idx,
      }))
        .filter((tag) => !visibleFilters || visibleFilters[tag.idx])
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
              className={clsx(
                filters[idx] ? "ActiveFilter bg-secondary-3" : "InactiveFilter"
              )}
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

  const renderClearFilter = useMemo(
    () => (
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
    ),
    [filters, setFilters]
  );

  return (
    <Dropdown
      icon={asButton ? undefined : "filter"}
      className="icon z-10"
      labeled={asButton ? undefined : type !== "mobile"}
      floating
      direction="left"
      trigger={
        asButton ? (
          <Button className="w-fit" size={size}>
            <Icon name="filter" />
            Filter
          </Button>
        ) : undefined
      }
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>
          {renderClearFilter}
          {renderDropdownItems}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}