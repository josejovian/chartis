import { ModalAuthInput } from "@/components/Modal";
import { UserProfile } from "@/components/User";
import { FIREBASE_COLLECTION_USERS } from "@/consts";
import { useIdentification, useToast } from "@/hooks";
import { ScreenSizeCategoryType, UserType } from "@/types";
import { FieldChangeName, FieldProfileEmail, updateData } from "@/utils";
import clsx from "clsx";
import { Form, Formik } from "formik";
import { useCallback, useMemo, useState } from "react";
import { Button } from "semantic-ui-react";

interface PageProfileEditProps {
  profile: UserType;
  type: ScreenSizeCategoryType;
  onEdit: () => void;
  onCancelEdit: () => void;
}

export function PageProfileEdit({
  profile,
  type,
  onEdit,
  onCancelEdit,
}: PageProfileEditProps) {
  const { stateIdentification } = useIdentification();
  const [identification, setIdentification] = stateIdentification;
  const { user } = identification;
  const { addToastPreset } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    (values: { name: string; email: string }) => {
      setSubmitting(true);
      if (user && user.id) {
        updateData(FIREBASE_COLLECTION_USERS, user.id, {
          name: values.name,
        })
          .then(() => {
            addToastPreset("feat-user-edit");
            setIdentification((prev) => ({
              ...prev,
              user: {
                ...user,
                name: values.name,
              },
            }));
            onEdit();
            setSubmitting(false);
          })
          .catch(() => {
            addToastPreset("fail-post");
            setSubmitting(false);
          });
      }
    },
    [addToastPreset, onEdit, setIdentification, user]
  );

  const renderForm = useMemo(
    () => (
      <Formik
        initialValues={{ name: profile.name, email: profile.email ?? "" }}
        onSubmit={handleSubmit}
        validate={(values) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errors: any = {};
          if (values.name === profile.name) {
            errors.name = "Name should be different from previous name.";
          }
          if (values.name === "") {
            errors.name = "Name is required.";
          }
          return errors;
        }}
        validateOnBlur
        validateOnChange
      >
        {({ errors }) => (
          <Form className="h-full">
            <ModalAuthInput
              props={FieldChangeName}
              classNameError={clsx(
                type !== "mobile" && "!text-left !ml-[60px]"
              )}
              size={type === "mobile" ? "small" : undefined}
            />
            <ModalAuthInput
              props={FieldProfileEmail}
              classNameError={clsx(
                type !== "mobile" && "!text-left !ml-[60px]"
              )}
              size={type === "mobile" ? "small" : undefined}
            />
            <div className="flex flex-wrap gap-4">
              <Button onClick={onCancelEdit} basic>
                Cancel
              </Button>
              <Button
                color="yellow"
                type="submit"
                disabled={
                  Object.keys(errors).length > 0 || errors === undefined
                }
                loading={submitting}
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [handleSubmit, onCancelEdit, profile.email, profile.name, submitting, type]
  );

  return (
    <>
      {type === "mobile" && <UserProfile profile={profile} />}
      {renderForm}
    </>
  );
}
