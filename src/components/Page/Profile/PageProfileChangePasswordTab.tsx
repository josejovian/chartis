/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
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
import clsx from "clsx";

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
  const { addToast, addToastPreset } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = useCallback(
    (currentPass: string, newPass: string) => {
      if (!user) return;
      if (!user.email) return;

      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPass
      );

      setSubmitting(true);

      reauthenticateWithCredential(user, credential)
        .then(() => {
          updatePassword(user, newPass)
            .then(() => {
              addToast({
                title: "Password changed",
                description: "",
                variant: "success",
              });
              router.push("/");
            })
            .catch(() => {
              addToastPreset("fail-post");
              setSubmitting(false);
            });
        })
        .catch((error: any) => {
          if (error.code === "auth/wrong-password") {
            addToast({
              title: "Your current password is incorrect",
              description: "Please enter your current password again",
              variant: "danger",
            });
          } else if (error.code === "auth/too-many-requests") {
            addToast({
              title: "Too many attempts",
              description: "Please try again later",
              variant: "danger",
            });
          } else {
            addToastPreset("fail-generic");
          }
        });
    },
    [addToast, addToastPreset, router, user]
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
          if (values.oldPassword === "") {
            errors.oldPassword = "Old password is required.";
          }
          if (
            values.newPassword !== values.confirmPassword &&
            values.confirmPassword !== ""
          ) {
            errors.newPassword =
              "New password should be the same as confirm password.";
          }
          if (values.newPassword === values.oldPassword) {
            errors.newPassword =
              "New password cannot be the same as old password.";
          }
          if (values.newPassword === "") {
            errors.newPassword = "New password is required.";
          }
          if (values.confirmPassword === "") {
            errors.confirmPassword = "Confirm password is required.";
          }
          return errors;
        }}
        validationSchema={SchemaChangePassword}
        validateOnBlur
        validateOnChange
      >
        {({ errors }) => (
          <Form>
            <ModalAuthInput
              props={FieldOldPassword}
              classNameError={clsx(
                type !== "mobile" && "!text-left !ml-[60px]"
              )}
              size={type === "mobile" ? "small" : undefined}
            />
            <ModalAuthInput
              props={FieldNewPassword}
              classNameError={clsx(
                type !== "mobile" && "!text-left !ml-[60px]"
              )}
              size={type === "mobile" ? "small" : undefined}
            />
            <ModalAuthInput
              props={FieldConfirmPassword}
              classNameError={clsx(
                type !== "mobile" && "!text-left !ml-[60px]"
              )}
              size={type === "mobile" ? "small" : undefined}
            />
            <div className="flex gap-4">
              <Button
                onClick={onCancelEdit}
                basic
                size={type === "mobile" ? "tiny" : undefined}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="yellow"
                disabled={
                  Object.keys(errors).length > 0 || errors === undefined
                }
                loading={submitting}
                size={type === "mobile" ? "tiny" : undefined}
              >
                Save
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [handleChangePassword, onCancelEdit, submitting, type]
  );

  return (
    <>
      {type === "mobile" && <UserProfile profile={profile} />}
      {renderForm}
    </>
  );
}
