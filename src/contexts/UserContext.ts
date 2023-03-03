/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";
import { UserType } from "@/types";

export const USER_CONTEXT_DEFAULT: UserType = {
  user: null,
  users: {},
  permission: "guest",
};

export const UserContext = createContext<UserType>(USER_CONTEXT_DEFAULT);
