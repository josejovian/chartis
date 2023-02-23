import { StateObject } from "@/types";
import { createContext, ReactNode } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const MODAL_CONTEXT_DEFAULT: StateObject<ReactNode> = [false, () => {}];

export const ModalContext = createContext(MODAL_CONTEXT_DEFAULT);
