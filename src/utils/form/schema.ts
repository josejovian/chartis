import * as Yup from "yup";
import {
  RuleDescription,
  RuleEmail,
  RuleName,
  RulePassword,
  RuleReason,
} from "./validation";

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
