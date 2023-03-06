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
}

export function FormErrorMessage({
  meta,
  className,
  overlap,
}: FormErrorMessageProps) {
  return (
    meta.touched &&
    meta.error && (
      <div
        className={clsx(
          "text-red-500 font-bold text-12px",
          overlap &&
            "absolute -bottom-2 p-0.5 bg-white mx-3 border-secondary-2",
          className
        )}
        style={{
          lineHeight: "12px",
        }}
      >
        <Icon name="warning sign" />
        {meta.error}
      </div>
    )
  );
}
