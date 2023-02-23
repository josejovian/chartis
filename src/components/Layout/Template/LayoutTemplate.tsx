import { CSSProperties, ReactNode, useMemo } from "react";
import { LayoutHead } from "@/components";
import clsx from "clsx";
import { useNavBar, useScreen } from "@/hooks";
import { LayoutHeadButtonProps } from "../Head/LayoutHeadButton";

export interface LayoutTemplateProps {
  classNameWrapper?: string;
  classNameMain?: string;
  inlineMain?: CSSProperties;
  children: ReactNode;
  side?: ReactNode;
  leftButton?: LayoutHeadButtonProps;
  leftElement?: ReactNode;
  rightButton?: LayoutHeadButtonProps;
  rightElement?: ReactNode;
  title: string;
}

export function LayoutTemplate({
  classNameWrapper,
  classNameMain,
  inlineMain,
  children,
  side,
  leftButton,
  leftElement,
  rightButton,
  rightElement,
  title,
}: LayoutTemplateProps) {
  const stateNavBar = useNavBar();
  const { type } = useScreen();

  console.log(inlineMain);

  const renderMain = useMemo(
    () => (
      <div className={clsx("flex flex-col w-full", "h-screen")}>
        <LayoutHead
          stateNavBar={stateNavBar}
          leftButton={leftButton}
          leftElement={leftElement}
          rightButton={rightButton}
          rightElement={rightElement}
          title={title}
          type={type}
        />
        <div
          className={clsx(
            "flex w-full h-full bg-sky-50 overflow-hidden",
            classNameMain
          )}
          style={inlineMain}
        >
          {children}
        </div>
      </div>
    ),
    [
      children,
      classNameMain,
      inlineMain,
      leftButton,
      leftElement,
      rightButton,
      rightElement,
      stateNavBar,
      title,
      type,
    ]
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
