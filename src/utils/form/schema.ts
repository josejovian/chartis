import * as Yup from "yup";
import { RuleEmail, RuleName, RulePassword } from "./validation";

export const SchemaRegister = Yup.object().shape({
  name: RuleName,
  email: RuleEmail,
  password: RulePassword,
});

export const SchemaLogin = Yup.object().shape({
  email: RuleEmail,
  password: RulePassword,
});
