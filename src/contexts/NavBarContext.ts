import { createContext } from "react";
import { StateObject } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const NAVBAR_CONTEXT_DEFAULT: StateObject<boolean> = [false, () => {}];

export const NavBarContext = createContext(NAVBAR_CONTEXT_DEFAULT);
