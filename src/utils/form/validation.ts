import * as Yup from "yup";

export const RuleName = Yup.string()
  .min(3, "Name is too short!")
  .max(30, "Name is too long!")
  .required("Name is required.");

export const RuleEmail = Yup.string()
  .email("Email is invalid.")
  .required("Email is required.");

export const RulePassword = Yup.string().required("Password is required.");
