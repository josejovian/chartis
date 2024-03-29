/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormCustomFieldProps } from "@/types/form";
import clsx from "clsx";
import { Field } from "formik";
import { Icon, Input, type InputProps } from "semantic-ui-react";

export interface ModalAuthInputProps extends InputProps {
  className?: string;
  classNameError?: string;
  props: FormCustomFieldProps;
}

export function ModalAuthInput({
  className,
  classNameError,
  props,
  ...rest
}: ModalAuthInputProps) {
  const { iconLabel, id, initial } = props;

  return (
    <Field name={id}>
      {({ field, form: { touched, errors }, meta }: any) => {
        return (
          <div>
            <Input
              defaultValue={initial}
              className={clsx("w-full mb-2", className)}
              label={{
                content: (
                  <Icon className="text-secondary-4" fitted name={iconLabel} />
                ),
              }}
              {...props}
              {...field}
              {...rest}
            />
            <div
              className={clsx(
                "mb-4 min-h-[16px] text-red-500 text-right",
                classNameError
              )}
            >
              {meta.touched && meta.error}
            </div>
          </div>
        );
      }}
    </Field>
  );
}
