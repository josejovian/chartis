/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";
import { IdentificationType, StateObject } from "@/types";

export const IDENTIFICATION_CONTEXT_DEFAULT: StateObject<IdentificationType> = [
  {
    user: null,
    users: {},
    permission: "guest",
  },
  () => {},
];

export const IdentificationContext = createContext<
  StateObject<IdentificationType>
>(IDENTIFICATION_CONTEXT_DEFAULT);
