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

export const FieldConfirmPass: FormCustomFieldProps = {
  id: "confirm",
  initial: "",
  name: "Confirm Password",
  placeholder: "Enter your password again",
  type: "password",
  iconLabel: "key"
}
