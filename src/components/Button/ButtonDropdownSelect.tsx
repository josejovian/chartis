import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { StateObject, DropdownOptionType } from "@/types";

export interface ButtonDropdownSelectMultipleProps<X extends string> {
  stateActive: StateObject<X[]>;
  type: "multiple";
}

export interface ButtonDropdownSelectSingleProps<X extends string> {
  stateActive: StateObject<X>;
  type: "single";
}

export interface ButtonDropdownSelectProps<X extends string> {
  name: string;
  options: Record<X, DropdownOptionType>;
  size?: SemanticSIZES;
}

export type ButtonDropdownSelectType<X extends string> =
  ButtonDropdownSelectProps<X> &
    // Either<ButtonDropdownSelectMultipleProps<X>, ButtonDropdownSelectSingleProps<X>>;
    (ButtonDropdownSelectMultipleProps<X> | ButtonDropdownSelectSingleProps<X>);

export function ButtonDropdownSelect<X extends string>({
  name,
  stateActive,
  options,
  size,
  type,
}: ButtonDropdownSelectType<X>) {
  const [active, setActive] = stateActive;
  const [open, setOpen] = useState(false);

  const selfId = useMemo(() => `Dropdown_${name}`, [name]);

  const renderDropdownItems = useMemo(
    () =>
      (Object.entries(options) as [X, DropdownOptionType][]).map(
        ([id, { name, color }]) => {
          const isActive =
            type === "single" ? active === id : active.includes(id);
          return (
            <Dropdown.Item
              key={name}
              value={name}
              className={clsx(
                type === "single"
                  ? [
                      active === id
                        ? "ActiveDropdownSelect"
                        : "InactiveDropdownSelect",
                    ]
                  : [
                      active.includes(id)
                        ? "ActiveDropdownSelect"
                        : "InactiveDropdownSelect",
                    ]
              )}
              onClick={() => {
                if (type === "single") {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setActive(id as any);
                } else {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  setActive((prev: any) =>
                    prev.includes(id)
                      ? prev.filter((tag: X) => tag !== id)
                      : [...prev, id]
                  );
                }
              }}
            >
              <Icon
                className={clsx(!isActive && "invisible")}
                color={color}
                name={type === "single" ? "check" : "check circle"}
              />
              <span>{name}</span>
            </Dropdown.Item>
          );
        }
      ),
    [active, setActive, options, type]
  );

  const renderClearDropdownSelect = useMemo(
    () => (
      <Dropdown.Item
        key="_all"
        value="_all"
        disabled={Object.values(active).filter((x) => x).length === 0}
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setActive([] as any);
        }}
      >
        <Icon name="close" />
        <span>Clear Options</span>
      </Dropdown.Item>
    ),
    [active, setActive]
  );

  const handleMaintainDropdownState = useCallback(
    (e: MouseEvent) => {
      const dropdownElement = document.getElementById(selfId);

      if (dropdownElement && dropdownElement.contains(e.target as Node)) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    },
    [selfId]
  );

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
      id={selfId}
      className="icon z-16"
      floating
      direction="left"
      trigger={
        <Button
          className="w-fit !pr-4 !h-full"
          size={size}
          onClick={() => setOpen(true)}
        >
          {name}
          <Icon className="!ml-2 !mr-0" name="triangle down" />
        </Button>
      }
      open={open}
    >
      <Dropdown.Menu>
        <Dropdown.Menu scrolling>
          {type === "multiple" && (
            <>
              {renderClearDropdownSelect}
              <Dropdown.Divider className="!m-0" />
            </>
          )}
          {renderDropdownItems}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}
