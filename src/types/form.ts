import { SemanticICONS } from "semantic-ui-react";

export interface FormCustomFieldProps {
  iconLabel?: SemanticICONS;
  id: string;
  initial: string;
  name: string;
  type: string;
  placeholder: string;
}

export interface FormLoginProps {
  email: string;
  password: string;
}

export interface FormRegisterProps {
  name: string;
  email: string;
  password: string;
}
