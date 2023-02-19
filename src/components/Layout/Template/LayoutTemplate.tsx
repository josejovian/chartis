import { ReactNode, useMemo } from "react";
import { LayoutHead } from "@/components";
import { ScreenSizeCategoryType, StateObject } from "@/types";
import clsx from "clsx";

export interface LayoutTemplateProps {
  children: ReactNode;
  side?: ReactNode;
  rightButton?: ReactNode;
  stateNavBar: StateObject<boolean>;
  title: string;
  type: ScreenSizeCategoryType;
}

export function LayoutTemplate({
  children,
  side,
  rightButton,
  stateNavBar,
  title,
  type,
}: LayoutTemplateProps) {
  const renderMain = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-col",
          type === "mobile" ? "h-fit" : "h-screen"
        )}
      >
        <LayoutHead
          stateNavBar={stateNavBar}
          rightButton={rightButton}
          title={title}
          type={type}
        />
        {children}
      </div>
    ),
    [children, rightButton, stateNavBar, title, type]
  );

  return (
    <div
      className={clsx(
        "flex h-screen",
        type === "mobile" && "flex flex-col flex-auto overflow-hidden"
      )}
    >
      <>
        {renderMain}
        {side}
      </>
    </div>
  );
}
