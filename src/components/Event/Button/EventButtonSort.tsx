import { useMemo } from "react";
import { Button, Dropdown, Icon, SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_SORT_CRITERIA } from "@/consts";
import { EventSortType, StateObject } from "@/types";

export interface EventButtonSortProps {
  size?: SemanticSIZES;
  stateSortBy: StateObject<EventSortType>;
}

export function EventButtonSort({ size, stateSortBy }: EventButtonSortProps) {
  const [sortBy, setSortBy] = stateSortBy;

  const renderDropdownItems = useMemo(
    () =>
      EVENT_SORT_CRITERIA.map((criterion) => {
        const { id, name } = criterion;
        return (
          <Dropdown.Item
            key={name}
            value={id}
            className={clsx(sortBy.id === id && "bg-secondary-3")}
            onClick={() => {
              setSortBy(criterion);
            }}
          >
            <span>{name}</span>
          </Dropdown.Item>
        );
      }),
    [setSortBy, sortBy]
  );
  return (
    <Dropdown
      className="icon z-10"
      labeled
      direction="left"
      floating
      trigger={
        <Button className="w-fit" size={size}>
          <Icon name="database" />
          Sort By
        </Button>
      }
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>{renderDropdownItems}</Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
