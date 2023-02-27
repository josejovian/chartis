import { ReactNode, useMemo } from "react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";
import { Form } from "semantic-ui-react";

export interface LayoutCardProps {
  className?: string;
  children: ReactNode;
  form?: boolean;
}

export function LayoutCard({ className, children, form }: LayoutCardProps) {
  const { type } = useScreen();

  const wrapperStyle = useMemo(
    () =>
      clsx(
        "flex flex-col bg-white min-w-full",
        type !== "mobile" && "rounded-lg",
        VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE[type],
        className
      ),
    [className, type]
  );

  return form ? (
    <Form className={wrapperStyle}>{children}</Form>
  ) : (
    <div className={wrapperStyle}>{children}</div>
  );
}

const VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!mx-80",
  desktop_sm: "!mx-10",
  mobile: "",
};
