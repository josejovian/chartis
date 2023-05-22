import { ReactNode, useCallback, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { ScreenSizeCategoryType, StateObject } from "@/types";
import {
  LayoutHeadButton,
  LayoutHeadButtonProps,
  LayoutHeadElement,
} from "@/components";
import Head from "next/head";

export interface LayoutHeadProps {
  stateNavBar: StateObject<boolean>;
  leftButton?: LayoutHeadButtonProps;
  leftElement?: ReactNode;
  rightButton?: LayoutHeadButtonProps;
  rightElement?: ReactNode;
  title: string;
  htmlTitle: string;
  type: ScreenSizeCategoryType;
}

export function LayoutHead({
  stateNavBar,
  leftButton,
  leftElement,
  rightButton,
  rightElement,
  title,
  htmlTitle,
  type,
}: LayoutHeadProps) {
  const setNavBar = stateNavBar[1];

  const handleToggleNavBar = useCallback(() => {
    setNavBar((prev) => !prev);
  }, [setNavBar]);

  const renderOverrideLeft = useMemo(
    () =>
      leftButton && (
        <LayoutHeadButton icon={leftButton.icon} onClick={leftButton.onClick} />
      ),
    [leftButton]
  );

  const renderOverrideRight = useMemo(
    () =>
      rightButton && (
        <LayoutHeadButton
          icon={rightButton.icon}
          onClick={rightButton.onClick}
        />
      ),
    [rightButton]
  );

  const renderToggleNavBar = useMemo(
    () => <LayoutHeadButton icon="bars" onClick={handleToggleNavBar} />,
    [handleToggleNavBar]
  );

  const renderLeft = useMemo(() => {
    if (leftElement)
      return <LayoutHeadElement>{leftElement}</LayoutHeadElement>;
    if (type === "mobile")
      return leftButton ? renderOverrideLeft : renderToggleNavBar;
    return renderOverrideLeft;
  }, [leftButton, leftElement, renderOverrideLeft, renderToggleNavBar, type]);

  const renderRight = useMemo(() => {
    if (rightElement)
      return <LayoutHeadElement>{rightElement}</LayoutHeadElement>;
    if (rightButton) return renderOverrideRight;
    return (
      <LayoutHeadElement className={clsx(!rightElement && "invisible")}>
        <Icon name="bars" />
      </LayoutHeadElement>
    );
  }, [rightButton, rightElement, renderOverrideRight]);

  const renderTitle = useMemo(
    () => <h2 className="text-16px font-normal text-center">{title}</h2>,
    [title]
  );

  const renderDesktopHead = useMemo(
    () => (
      <div
        className={clsx(
          LAYOUT_HEAD_DESKTOP_STYLE,
          type === "desktop_sm" && "!px-8"
        )}
        style={{
          height: "48px",
        }}
      >
        <div className="flex items-center gap-4">
          {renderLeft}
          {renderTitle}
        </div>
        {renderRight}
      </div>
    ),
    [renderLeft, renderRight, renderTitle, type]
  );

  const renderMobileHead = useMemo(
    () => (
      <>
        <div
          className={LAYOUT_HEAD_MOBILE_STYLE}
          style={{
            minHeight: "64px",
          }}
        >
          {renderLeft}
          {renderTitle}
          {renderRight}
        </div>
      </>
    ),
    [renderLeft, renderRight, renderTitle]
  );

  return (
    <>
      <Head>
        <title>{htmlTitle ? `Chartis | ${htmlTitle}` : "Chartis"}</title>
      </Head>
      {type === "mobile" ? renderMobileHead : renderDesktopHead}
    </>
  );
}

const LAYOUT_HEAD_BASE_STYLE = clsx(
  "flex items-center justify-between bg-white"
);

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

export const LAYOUT_HEAD_BUTTON_BASE_STYLE = clsx(
  "aspect-square p-2 cursor-pointer rounded-full"
);

export const LAYOUT_HEAD_BUTTON_DESKTOP_STYLE =
  "hover:bg-secondary-1 focus:bg-secondary-2 active:bg-secondary-2";
