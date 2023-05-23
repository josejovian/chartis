import { CSSProperties, ReactNode, useMemo } from "react";
import clsx from "clsx";
import { LayoutHead, LayoutHeadButtonProps } from "@/components";
import { useNavBar, useScreen } from "@/hooks";
import { UserPermissionType } from "@/types";

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
  htmlTitle: string;
  minPermission?: UserPermissionType;
  authorized?: boolean;
  unauthorizedElement?: ReactNode;
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
  htmlTitle,
  minPermission,
  authorized,
  unauthorizedElement,
}: LayoutTemplateProps) {
  const screen = useScreen();
  const { type } = screen;
  const { stateNavBar } = useNavBar({
    screen,
  });

  const showContent = useMemo(() => {
    return !minPermission || authorized;
  }, [authorized, minPermission]);

  const renderPage = useMemo(() => {
    if (showContent) {
      return children;
    }

    if (authorized === false) {
      return unauthorizedElement;
    }

    return <></>;
  }, [authorized, children, showContent, unauthorizedElement]);

  const renderMain = useMemo(
    () => (
      <div className={clsx("flex flex-col w-full", "h-full")}>
        <LayoutHead
          stateNavBar={stateNavBar}
          leftButton={showContent ? leftButton : undefined}
          leftElement={showContent ? leftElement : undefined}
          rightButton={showContent ? rightButton : undefined}
          rightElement={showContent ? rightElement : undefined}
          title={showContent ? title : ""}
          htmlTitle={showContent ? htmlTitle : "Not Found"}
          type={type}
        />
        <div
          className={clsx(
            "flex w-full  bg-sky-50 overflow-hidden h-full",
            classNameMain
          )}
          style={inlineMain}
        >
          {renderPage}
        </div>
      </div>
    ),
    [
      classNameMain,
      htmlTitle,
      inlineMain,
      leftButton,
      leftElement,
      renderPage,
      rightButton,
      rightElement,
      showContent,
      stateNavBar,
      title,
      type,
    ]
  );

  return (
    <div
      className={clsx(
        "flex h-full w-full",
        type === "mobile" && "flex flex-col flex-auto overflow-hidden",
        classNameWrapper
      )}
    >
      {renderMain}
      {side}
    </div>
  );
}
