import { FormCustomFieldProps } from "@/types";
import {
  FieldConfirmPassword,
  FieldEmail,
  FieldName,
  FieldPassword,
} from "./field";

export const FormRegister: FormCustomFieldProps[] = [
  FieldName,
  FieldEmail,
  FieldPassword,
  FieldConfirmPassword,
];

export const FormLogin: FormCustomFieldProps[] = [FieldEmail, FieldPassword];
