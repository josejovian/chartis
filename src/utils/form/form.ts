import { FormCustomFieldProps } from "@/types";
import { FieldConfirmPass, FieldEmail, FieldName, FieldPassword } from "./field";

export const FormRegister: FormCustomFieldProps[] = [
  FieldName,
  FieldEmail,
  FieldPassword,
  FieldConfirmPass
];

export const FormLogin: FormCustomFieldProps[] = [FieldEmail, FieldPassword];
