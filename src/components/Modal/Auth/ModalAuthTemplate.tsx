import { ReactNode, useMemo } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { ModalAuthInput } from "@/components";
import { useScreen } from "@/hooks";
import { Form, Formik } from "formik";
import { FormCustomFieldProps } from "@/types";

export interface ModalAuthTemplateProps {
  formName: string;
  formHead: ReactNode;
  formFields: FormCustomFieldProps[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formSchema: Record<string, any>;
  overrideInitialValues?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: Record<string, any>) => void;
  loading: boolean;
}

export function ModalAuthTemplate({
  formName,
  formHead,
  formFields,
  formSchema,
  overrideInitialValues,
  onSubmit,
  loading,
}: ModalAuthTemplateProps) {
  const { type } = useScreen();

  const initialValues: Record<string, string> = useMemo(
    () =>
      overrideInitialValues ??
      (formFields.reduce(
        (prev, value) => ({
          ...prev,
          [value.id]: value.initial,
        }),
        {}
      ) as Record<string, string>),
    [formFields, overrideInitialValues]
  );

  const renderFormBody = useMemo(
    () => (
      <Formik
        initialValues={initialValues}
        validationSchema={formSchema}
        onSubmit={(values) => {
          onSubmit(values);
        }}
      >
        <Form
          className={clsx(
            "flex flex-col items-center bg-white",
            type === "mobile" ? "w-full" : "!w-80"
          )}
        >
          {formFields.map((field) => (
            <ModalAuthInput key={`Field_${field.id}`} props={field} />
          ))}
          <Button
            className="mt-2"
            type="submit"
            color="yellow"
            loading={loading}
          >
            {formName}
          </Button>
        </Form>
      </Formik>
    ),
    [formFields, formName, formSchema, initialValues, loading, onSubmit, type]
  );

  return (
    <div className="flex flex-col items-center">
      {formHead}
      {renderFormBody}
    </div>
  );
}
