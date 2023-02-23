import { ReactNode } from "react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export interface LayoutCardProps {
  className?: string;
  children: ReactNode;
}

export function LayoutCard({ className, children }: LayoutCardProps) {
  const { type } = useScreen();
  return (
    <div
      className={clsx(
        "flex flex-col bg-white min-w-full",
        type !== "mobile" && "rounded-lg",
        VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE[type],
        className
      )}
    >
      {children}
    </div>
  );
}

const VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!mx-80",
  desktop_sm: "!mx-10",
  mobile: "",
};
