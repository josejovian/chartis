/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "formik";
import { Input, InputProps } from "semantic-ui-react";
import clsx from "clsx";
import { FormErrorMessage } from "@/components";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface PageViewEventCardDetailEditorProps extends Omit<InputProps, "name"> {
  name: string;
  validate?: (value: unknown) => string | null;
}

export function PageViewEventCardDetailEditor({
  name,
  validate,
  className,
  ...props
}: PageViewEventCardDetailEditorProps) {
  return (
    <Field name={name} validate={validate}>
      {({ field, meta }: any) => (
        <div className={className}>
          <Input
            name={name}
            className={clsx("w-full !border-0 !h-10")}
            transparent
            {...props}
            {...field}
          />
          <FormErrorMessage
            meta={meta}
            // className="absolute -bottom-1.5 bg-white mx-3 !z-50 border border-secondary-2"
            overlap
          />
        </div>
      )}
    </Field>
  );
}
