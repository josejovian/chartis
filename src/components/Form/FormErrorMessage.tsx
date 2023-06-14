import clsx from "clsx";
import { Icon } from "semantic-ui-react";

export interface FormErrorMessageProps {
  hideIfNone?: boolean;
  showError?: boolean;
  error?: string;
  className?: string;
  overlap?: boolean;
  icon?: boolean;
}

export function FormErrorMessage({
  className,
  overlap,
  showError,
  error,
  hideIfNone,
}: FormErrorMessageProps) {
  const visible = showError && error;
  return (visible || !overlap) && (!hideIfNone || visible) ? (
    <div
      className={clsx(
        "text-red-500",
        overlap
          ? [
              "absolute -bottom-2 p-0.5 bg-white mx-3",
              "border-secondary-2 font-bold text-12px",
            ]
          : "text-16px h-4",
        className
      )}
      style={{
        lineHeight: "12px",
      }}
    >
      {overlap && <Icon name="warning sign" />}
      {error || overlap ? error : ""}
    </div>
  ) : (
    <></>
  );
}
