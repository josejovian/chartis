import { ReactNode } from "react";
import { LayoutHead } from "@/components";
import { ScreenSizeCategoryType, StateObject } from "@/types";

export interface LayoutTemplateProps {
  children: ReactNode;
  rightButton?: ReactNode;
  stateNavBar: StateObject<boolean>;
  title: string;
  type: ScreenSizeCategoryType;
}

export function LayoutTemplate({
  children,
  rightButton,
  stateNavBar,
  title,
  type,
}: LayoutTemplateProps) {
  return (
    <>
      <div className="z-20">
        <LayoutHead
          stateNavBar={stateNavBar}
          rightButton={rightButton}
          title={title}
          type={type}
        />
      </div>
      {children}
    </>
  );
}
