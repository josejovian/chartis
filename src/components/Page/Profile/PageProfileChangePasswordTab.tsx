/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { useRouter } from "next/router";
import { Form, Formik } from "formik";
import {
  reauthenticateWithCredential,
  updatePassword,
  type User,
} from "firebase/auth";
import { Button } from "semantic-ui-react";
import { ModalAuthInput, UserProfile } from "@/components";
import { useToast } from "@/hooks";
import {
  FieldConfirmPassword,
  FieldNewPassword,
  FieldOldPassword,
  SchemaChangePassword,
} from "@/utils";
import { ScreenSizeCategoryType, UserType } from "@/types";

interface PageProfileChangePasswordTabProps {
  user: User;
  profile: UserType;
  type: ScreenSizeCategoryType;
  onCancelEdit: () => void;
}

export function PageProfileChangePasswordTab({
  user,
  profile,
  type,
  onCancelEdit,
}: PageProfileChangePasswordTabProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const handleChangePassword = useCallback(
    (currentPass: string, newPass: string) => {
      if (!user) return;
      if (!user.email) return;

      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPass
      );

      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPass)
            .then(() => {
              // Password successfully updated
              addToast({
                title: "Password changed",
                description: "Please login again",
                variant: "success",
              });
              router.push("/");
            })
            .catch((error: any) => {
              // There was an error updating the user's password
              /* eslint-disable no-console */
              console.error(error);
            });
        })
        .catch((error: any) => {
          // There was an error reauthenticating the user
          /* eslint-disable no-console */
          console.error(error);
        });
    },
    [addToast, router, user]
  );

  const renderForm = useMemo(
    () => (
      <Formik
        initialValues={{
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        }}
        onSubmit={({ oldPassword, newPassword }) => {
          handleChangePassword(oldPassword, newPassword);
        }}
        validate={(values) => {
          const errors: any = {};
          if (
            values.newPassword !== values.confirmPassword &&
            values.confirmPassword !== ""
          ) {
            errors.newPassword =
              "New password should be the same as confirm password!";
          }
          if (values.newPassword === values.oldPassword) {
            errors.newPassword =
              "New password cannot be the same as old password!";
          }
          if (values.confirmPassword === "") {
            errors.confirmPassword = "Fill in confirm password!";
          }
          console.log(errors);
          return errors;
        }}
        validationSchema={SchemaChangePassword}
        validateOnBlur
        validateOnChange
      >
        {({ errors }) => (
          <Form>
            <ModalAuthInput props={FieldOldPassword} />
            <ModalAuthInput props={FieldNewPassword} />
            <ModalAuthInput
              props={{
                ...FieldConfirmPassword,
                placeholder: "Confirm your NEW password",
              }}
            />
            <div className="flex gap-4">
              <Button onClick={onCancelEdit}>Cancel</Button>
              <Button
                type="submit"
                color="yellow"
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
    [handleChangePassword, onCancelEdit]
  );

  return (
    <>
      {type === "mobile" && <UserProfile profile={profile} />}
      {renderForm}
    </>
  );
}
