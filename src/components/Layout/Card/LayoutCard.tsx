import { ReactNode, useMemo } from "react";
import { Form } from "semantic-ui-react";
import clsx from "clsx";
import { useScreen } from "@/hooks";

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
