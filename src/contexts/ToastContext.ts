/* eslint-disable @typescript-eslint/no-empty-function */
import { createContext } from "react";
import { ToastContextPropsType } from "@/types";

export const TOAST_CONTEXT_DEFAULT: ToastContextPropsType = {
  toasts: [],
  setToasts: (newToasts) => {},
  addToast: (newToast) => {},
  addToastPreset: (newToast) => {},
};

export const ToastContext = createContext(TOAST_CONTEXT_DEFAULT);
