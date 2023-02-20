import { ReactNode, useMemo } from "react";
import { LayoutHead } from "@/components";
import clsx from "clsx";
import { useNavBar, useScreen } from "@/hooks";

export interface LayoutTemplateProps {
  classNameWrapper?: string;
  classNameMain?: string;
  children: ReactNode;
  side?: ReactNode;
  rightButton?: ReactNode;
  title: string;
}

export function LayoutTemplate({
  classNameWrapper,
  classNameMain,
  children,
  side,
  rightButton,
  title,
}: LayoutTemplateProps) {
  const stateNavBar = useNavBar();
  const { type } = useScreen();

  const renderMain = useMemo(
    () => (
      <div className={clsx("flex flex-col w-full", "h-screen")}>
        <LayoutHead
          stateNavBar={stateNavBar}
          rightButton={rightButton}
          title={title}
          type={type}
        />
        <div
          className={clsx(
            "flex w-full h-full bg-amber-50 overflow-hidden",
            classNameMain
          )}
        >
          {children}
        </div>
      </div>
    ),
    [children, classNameMain, rightButton, stateNavBar, title, type]
  );

  return (
    <div
      className={clsx(
        "flex h-screen w-full",
        type === "mobile" && "flex flex-col flex-auto overflow-hidden",
        classNameWrapper
      )}
    >
      {renderMain}
      {side}
    </div>
  );
}
