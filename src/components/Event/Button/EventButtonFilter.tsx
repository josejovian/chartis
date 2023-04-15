import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [open, setOpen] = useState(false);

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
              className={clsx(filters[idx] ? "ActiveFilter" : "InactiveFilter")}
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

  const handleMaintainDropdownState = useCallback((e: MouseEvent) => {
    const dropdownElement = document.getElementById("FilterDropdown");

    if (dropdownElement && dropdownElement.contains(e.target as Node)) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, []);

  const handleImplementListeners = useCallback(() => {
    window.removeEventListener("click", handleMaintainDropdownState, {
      capture: true,
    });
    window.addEventListener("click", handleMaintainDropdownState, {
      capture: true,
    });
  }, [handleMaintainDropdownState]);

  useEffect(() => {
    handleImplementListeners();
  }, [handleImplementListeners]);

  return (
    <Dropdown
      id="FilterDropdown"
      icon={asButton ? undefined : "filter"}
      className="icon z-16"
      labeled={asButton ? undefined : type !== "mobile"}
      floating
      direction="left"
      trigger={
        asButton ? (
          <Button className="w-fit" size={size} onClick={() => setOpen(true)}>
            <Icon name="filter" />
            Filter
          </Button>
        ) : undefined
      }
      open={open}
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
