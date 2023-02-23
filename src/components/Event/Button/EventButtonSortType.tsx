import { useMemo } from "react";
import { Button, Dropdown, Icon, SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EVENT_SORT_TYPE } from "@/consts";
import { StateObject } from "@/types";

export interface EventButtonSortTypeProps {
  size?: SemanticSIZES;
  stateSortDescending: StateObject<boolean>;
}

export function EventButtonSortType({
  size,
  stateSortDescending,
}: EventButtonSortTypeProps) {
  const [sortDescending, setSortDescending] = stateSortDescending;

  const renderDropdownItems = useMemo(
    () =>
      EVENT_SORT_TYPE.map(({ name, value }) => {
        return (
          <Dropdown.Item
            key={name}
            value={name}
            className={clsx(sortDescending === value && "bg-secondary-3")}
            onClick={() => {
              setSortDescending(value);
            }}
          >
            <span>{name}</span>
          </Dropdown.Item>
        );
      }),
    [setSortDescending, sortDescending]
  );

  return (
    <Dropdown
      className="icon z-10"
      direction="left"
      floating
      trigger={
        <Button className="w-fit" icon size={size}>
          <Icon
            name={`sort content ${sortDescending ? "descending" : "ascending"}`}
          />
        </Button>
      }
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>{renderDropdownItems}</Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
