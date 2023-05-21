import * as Yup from "yup";
import { RuleDescription, RuleName, RuleReason } from "./validation";
import { VALIDATION_USER_PASSWORD_MIN_LENGTH } from "./const";

const RuleEmail = Yup.string()
  .email("Email is invalid.")
  .required("Email is required.");

const RulePassword = Yup.string()
  .required("Password is required.")
  .min(
    VALIDATION_USER_PASSWORD_MIN_LENGTH,
    `Password is too short (min. ${VALIDATION_USER_PASSWORD_MIN_LENGTH} chars)`
  );

export const SchemaRegister = Yup.object().shape({
  name: RuleName,
  email: RuleEmail,
  password: RulePassword,
});

export const SchemaLogin = Yup.object().shape({
  email: RuleEmail,
  password: RulePassword,
});

export const SchemaEvent = Yup.object().shape({
  name: RuleName,
  description: RuleDescription,
});

export const SchemaReport = Yup.object().shape({
  reason: RuleReason,
});

export const SchemaChangePassword = Yup.object().shape({
  newPassword: RulePassword,
});
