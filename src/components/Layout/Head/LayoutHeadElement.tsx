import { ReactNode } from "react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
import {
  LAYOUT_HEAD_BUTTON_BASE_STYLE,
  LAYOUT_HEAD_BUTTON_DESKTOP_STYLE,
} from "./LayoutHead";

export interface LayoutHeadElementProps {
  children: ReactNode;
  className?: string;
}

export function LayoutHeadElement({
  children,
  className,
}: LayoutHeadElementProps) {
  const { type } = useScreen();
  return (
    <div
      className={clsx(
        LAYOUT_HEAD_BUTTON_BASE_STYLE,
        type !== "mobile" && LAYOUT_HEAD_BUTTON_DESKTOP_STYLE,
        className
      )}
    >
      {children}
    </div>
  );
}
