import { useMemo } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_SORT_CRITERIA } from "@/consts";
import {
  DropdownSortOptionType,
  EventType,
  StateObject,
  UserType,
} from "@/types";

export interface ButtonDropdownSortProps<X> {
  size?: SemanticSIZES;
  options: DropdownSortOptionType<X>[];
  stateSortBy: StateObject<DropdownSortOptionType<X>>;
  stateSortDescending: StateObject<boolean>;
}

export function ButtonDropdownSort<X>({
  size,
  options,
  stateSortBy,
  stateSortDescending,
}: ButtonDropdownSortProps<X>) {
  const [sortBy, setSortBy] = stateSortBy;
  const setSortDescending = stateSortDescending[1];

  const renderDropdownItems = useMemo(
    () =>
      options.map((criterion) => {
        const { id, name, descending } = criterion;
        const active = sortBy.id === id;
        return (
          <Dropdown.Item
            key={name}
            value={id}
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setSortBy(criterion as any);
              setSortDescending(descending);
            }}
          >
            <Icon className={clsx(!active && "invisible")} name="check" />
            <span>{name}</span>
          </Dropdown.Item>
        );
      }),
    [options, setSortBy, setSortDescending, sortBy.id]
  );
  return (
    <Dropdown
      className="icon z-16"
      labeled
      direction="left"
      floating
      trigger={
        <Button className="w-fit !pr-2 !h-full" size={size}>
          Sort
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
