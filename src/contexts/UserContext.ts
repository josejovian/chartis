/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";
import { UserObjectType } from "@/types";

export const USER_CONTEXT_DEFAULT = null;

export const UserContext = createContext<UserObjectType>(USER_CONTEXT_DEFAULT);
