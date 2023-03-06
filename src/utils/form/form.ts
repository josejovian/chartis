import { FormCustomFieldProps } from "@/types";
import { FieldEmail, FieldName, FieldPassword } from "./field";

export const FormRegister: FormCustomFieldProps[] = [
  FieldName,
  FieldEmail,
  FieldPassword,
];

export const FormLogin: FormCustomFieldProps[] = [FieldEmail, FieldPassword];
