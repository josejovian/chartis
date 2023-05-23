/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "formik";
import { Input, type InputProps } from "semantic-ui-react";
import clsx from "clsx";
import { FormErrorMessage } from "@/components";
import { ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PageViewEventCardDetailTabDetailEditorProps
  extends Omit<InputProps, "name"> {
  name: string;
  validate?: (value: unknown) => string | null;
  children?: ReactNode;
}

export function PageViewEventCardDetailTabDetailEditor({
  id,
  name,
  validate,
  className,
  children,
  ...props
}: PageViewEventCardDetailTabDetailEditorProps) {
  return (
    <Field name={name} validate={validate}>
      {({ field, meta }: any) => (
        <div className={clsx(className, "break-word")}>
          <Input
            id={id}
            name={name}
            className={clsx(
              "break-word",
              !children ? "w-full !border-0 !h-10" : "!hidden"
            )}
            transparent
            {...props}
            {...field}
            onClick={(event: any) => event.target.showPicker()}
          />
          {children}
          <FormErrorMessage
            error={meta.error}
            showError={meta.touched}
            overlap
          />
        </div>
      )}
    </Field>
  );
}
