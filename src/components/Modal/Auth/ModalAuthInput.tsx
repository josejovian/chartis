/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormCustomFieldProps } from "@/types/form";
import clsx from "clsx";
import { Field } from "formik";
import { Icon, Input, type InputProps } from "semantic-ui-react";

export interface ModalAuthInputProps extends InputProps {
  className?: string;
  props: FormCustomFieldProps;
}

export function ModalAuthInput({
  className,
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
            />
            <div className="mb-4 h-4 text-red-500 text-right">
              {meta.touched && meta.error}
            </div>
          </div>
        );
      }}
    </Field>
  );
}
