import { useMemo } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_SORT_CRITERIA } from "@/consts";
import { EventSortType, StateObject } from "@/types";

export interface EventButtonSortProps {
  size?: SemanticSIZES;
  stateSortBy: StateObject<EventSortType>;
  stateSortDescending: StateObject<boolean>;
}

export function EventButtonSort({
  size,
  stateSortBy,
  stateSortDescending,
}: EventButtonSortProps) {
  const [sortBy, setSortBy] = stateSortBy;
  const setSortDescending = stateSortDescending[1];

  const renderDropdownItems = useMemo(
    () =>
      EVENT_SORT_CRITERIA.map((criterion) => {
        const { id, name, descending } = criterion;
        const active = sortBy.id === id;
        return (
          <Dropdown.Item
            key={name}
            value={id}
            onClick={() => {
              setSortBy(criterion);
              setSortDescending(descending);
            }}
          >
            <Icon
              size="small"
              className={clsx(!active && "invisible")}
              name="check"
            />
            <span>{name}</span>
          </Dropdown.Item>
        );
      }),
    [setSortBy, setSortDescending, sortBy.id]
  );
  return (
    <Dropdown
      className="icon z-16"
      labeled
      direction="left"
      floating
      trigger={
        <Button className="w-fit !pr-2" size={size}>
          Sort By
          <Icon className="!ml-2 !mr-0" name="triangle down" />
        </Button>
      }
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>{renderDropdownItems}</Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
