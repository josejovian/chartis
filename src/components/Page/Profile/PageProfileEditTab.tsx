import { ModalAuthInput } from "@/components/Modal";
import { UserProfile } from "@/components/User";
import { FIREBASE_COLLECTION_USERS } from "@/consts";
import { updateData } from "@/firebase";
import { ScreenSizeCategoryType, UserType } from "@/types";
import { FieldChangeName, FieldProfileEmail } from "@/utils";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useCallback, useMemo } from "react";
import { Button } from "semantic-ui-react";

interface PageProfileEditProps {
  profile: UserType;
  type: ScreenSizeCategoryType;
  onCancelEdit: () => void;
}

export function PageProfileEdit({
  profile,
  type,
  onCancelEdit,
}: PageProfileEditProps) {
  const router = useRouter();

  const handleSubmit = useCallback(
    (values: { name: string; email: string }) => {
      updateData(FIREBASE_COLLECTION_USERS, profile.id, {
        name: values.name,
      }).then(() => {
        router.reload();
      });
    },
    [profile.id, router]
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
            errors.name = "Name should be different from previous name!";
          }
          if (values.name === "") {
            errors.name = "Name cannot be empty!";
          }
          return errors;
        }}
        validateOnBlur
        validateOnChange
      >
        {({ errors }) => (
          <Form className="h-full">
            <ModalAuthInput props={FieldChangeName} />
            <ModalAuthInput props={FieldProfileEmail} />
            <div className="flex gap-4">
              <Button onClick={onCancelEdit}>Cancel</Button>
              <Button
                color="yellow"
                type="submit"
                disabled={
                  Object.keys(errors).length > 0 || errors === undefined
                }
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [handleSubmit, onCancelEdit, profile.email, profile.name]
  );

  return (
    <>
      {type === "mobile" && <UserProfile profile={profile} />}
      {renderForm}
    </>
  );
}