import { ReactNode, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { ScreenSizeCategoryType, StateObject } from "@/types";

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
    () =>
      type === "mobile" && (
        <div
          className="p-2"
          onClick={() => {
            setNavBar((prev) => !prev);
          }}
        >
          <Icon name="bars" />
        </div>
      ),
    [setNavBar, type]
  );

  const renderTitle = useMemo(
    () => <h2 className="text-16px font-normal text-center">{title}</h2>,
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
    <div
      className={clsx(
        type === "mobile"
          ? LAYOUT_HEAD_MOBILE_STYLE
          : LAYOUT_HEAD_DESKTOP_STYLE,
        type === "desktop_sm" && "px-8"
      )}
    >
      {renderLeft}
      {renderTitle}
      {renderRight}
    </div>
  );
}

const LAYOUT_HEAD_BASE_STYLE = clsx("flex items-center justify-between");

const LAYOUT_HEAD_MOBILE_STYLE = clsx(
  LAYOUT_HEAD_BASE_STYLE,
  "w-screen !h-16 pt-2 px-2",
  "bg-amber-300 z-10"
);

const LAYOUT_HEAD_DESKTOP_STYLE = clsx(
  LAYOUT_HEAD_BASE_STYLE,
  "w-full !h-12 px-16",
  "border-b border-secondary-2 z-10"
);
