import clsx from "clsx";
import { Icon } from "semantic-ui-react";

export interface FormErrorMessageProps {
  meta: {
    touched: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any;
  };
  className?: string;
  overlap?: boolean;
  icon?: boolean;
}

export function FormErrorMessage({
  meta,
  className,
  overlap,
  icon = false,
}: FormErrorMessageProps) {
  return (
    ((meta.touched && meta.error) || !overlap) && (
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
        {meta.error || overlap ? meta.error : ""}
      </div>
    )
  );
}
