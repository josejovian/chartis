import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_TAGS } from "@/consts";
import { EventTagNameType, EventTagType, StateObject } from "@/types";

export interface EventButtonFilterProps {
  stateFilters: StateObject<EventTagNameType[]>;
  asButton?: boolean;
  size?: SemanticSIZES;
}

export function EventButtonFilter({
  stateFilters,
  asButton,
  size,
}: EventButtonFilterProps) {
  const [filters, setFilters] = stateFilters;
  const [open, setOpen] = useState(false);

  const renderDropdownItems = useMemo(
    () =>
      (Object.entries(EVENT_TAGS) as [EventTagNameType, EventTagType][]).map(
        ([id, { name, color }]) => {
          const active = filters.includes(id);
          return (
            <Dropdown.Item
              key={name}
              value={name}
              className={clsx(
                filters.includes(id) ? "ActiveFilter" : "InactiveFilter"
              )}
              onClick={() => {
                setFilters((prev) =>
                  prev.includes(id)
                    ? prev.filter((tag) => tag !== id)
                    : [...prev, id]
                );
              }}
            >
              <Icon
                className={clsx(!active && "invisible")}
                color={color}
                name="check circle"
              />
              <span>{name}</span>
            </Dropdown.Item>
          );
        }
      ),
    [filters, setFilters]
  );

  const renderClearFilter = useMemo(
    () => (
      <Dropdown.Item
        key="_all"
        value="_all"
        disabled={Object.values(filters).filter((x) => x).length === 0}
        onClick={() => {
          setFilters([]);
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
      className="icon z-16"
      floating
      direction="left"
      trigger={
        asButton ? (
          <Button
            className="w-fit !pr-4"
            size={size}
            onClick={() => setOpen(true)}
          >
            Filter
            <Icon className="!ml-2 !mr-0" name="triangle down" />
          </Button>
        ) : (
          <Button
            className="w-fit !pr-4"
            size={size}
            onClick={() => setOpen(true)}
          >
            Filter
            <Icon className="!ml-2 !mr-0" name="triangle down" />
          </Button>
        )
      }
      open={open}
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>
          {renderClearFilter}
          <Dropdown.Divider className="!m-0" />
          {renderDropdownItems}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
