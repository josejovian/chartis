/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "formik";
// eslint-disable-next-line import/named
import { Dropdown, Input, StrictDropdownProps } from "semantic-ui-react";
import { FormErrorMessage, FormErrorMessageProps } from "./FormErrorMessage";

interface FormInputDropdownProps extends StrictDropdownProps {
  fieldName: string;
  validateForm?: () => void;
  formErrorMessageProps?: Partial<FormErrorMessageProps>;
}

export function FormInputDropdown({
  fieldName,
  validateForm,
  formErrorMessageProps,
  ...rest
}: FormInputDropdownProps) {
  return (
    <>
      <Dropdown
        className="!border-0 !min-h-0 !py-0"
        fluid
        selection
        transparent
        onMouseDown={() => validateForm && validateForm()}
        onBlur={() => validateForm && validateForm()}
        {...rest}
      />
      <Field name={fieldName}>
        {({ field, meta }: any) => (
          <>
            <Input className="!hidden" size="big" transparent {...field} />
            <FormErrorMessage
              error={meta.error}
              showError={meta.error && meta.touched}
              className="!z-10"
              {...formErrorMessageProps}
            />
          </>
        )}
      </Field>
    </>
  );
}
