import { FormCustomFieldProps } from "@/types";

export const FieldName: FormCustomFieldProps = {
  id: "name",
  initial: "",
  name: "Full Name",
  placeholder: "Enter your name",
  type: "text",
  iconLabel: "user",
};

export const FieldEmail: FormCustomFieldProps = {
  id: "email",
  initial: "",
  name: "Email",
  placeholder: "Enter your email",
  type: "email",
  iconLabel: "mail",
};

export const FieldPassword: FormCustomFieldProps = {
  id: "password",
  initial: "",
  name: "Password",
  placeholder: "Enter your password",
  type: "password",
  iconLabel: "key",
};

export const FieldConfirmPassword: FormCustomFieldProps = {
  id: "confirmPassword",
  initial: "",
  name: "Confirm Password",
  placeholder: "Confirm password",
  type: "password",
  iconLabel: "key",
};

export const FieldChangeName: FormCustomFieldProps = {
  id: "name",
  initial: "",
  name: "Full Name",
  placeholder: "Enter your name",
  type: "text",
  iconLabel: "user",
};

export const FieldProfileEmail: FormCustomFieldProps = {
  id: "email",
  initial: "",
  name: "Email",
  placeholder: "Enter your name",
  type: "text",
  iconLabel: "mail",
  disabled: true,
};

export const FieldOldPassword: FormCustomFieldProps = {
  id: "oldPassword",
  initial: "",
  name: "Password",
  placeholder: "Old password",
  type: "password",
  iconLabel: "key",
};

export const FieldNewPassword: FormCustomFieldProps = {
  id: "newPassword",
  initial: "",
  name: "Password",
  placeholder: "New password",
  type: "password",
  iconLabel: "key",
};
