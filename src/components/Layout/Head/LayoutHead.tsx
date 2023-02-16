import { ReactNode, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { ScreenSizeCategoryType, StateObject } from "@/types";

const LAYOUT_HEAD_STYLE = clsx(
  "fixed top-0 w-screen h-16 pt-2 px-2",
  "flex items-center justify-between",
  "bg-amber-300 z-10"
);

export interface LayoutHeadProps {
  stateNavBar: StateObject<boolean>;
  rightButton?: ReactNode;
  title: string;
  type: ScreenSizeCategoryType;
}

export function LayoutHead({
  stateNavBar,
  rightButton,
  title,
  type,
}: LayoutHeadProps) {
  const setNavBar = stateNavBar[1];

  const renderLeft = useMemo(
    () => (
      <div
        className="p-2"
        onClick={() => {
          setNavBar((prev) => !prev);
        }}
      >
        <Icon name="bars" />
      </div>
    ),
    [setNavBar]
  );

  const renderTitle = useMemo(
    () => <h2 className="text-16px text-center">{title}</h2>,
    [title]
  );

  const renderRight = useMemo(
    () => (
      <div className={clsx("HeadRightButton p-2", !rightButton && "invisible")}>
        {rightButton ?? <Icon name="bars" />}
      </div>
    ),
    [rightButton]
  );

  return (
    <>
      {type === "mobile" && (
        <div className={LAYOUT_HEAD_STYLE}>
          {renderLeft}
          {renderTitle}
          {renderRight}
        </div>
      )}
    </>
  );
}
