/* eslint-disable @typescript-eslint/no-empty-function */
import { ReactNode, createContext } from "react";
import {
  ScreenSizeType,
  StateObject,
  IdentificationType,
  ToastContextPropsType,
} from "@/types";

const IDENTIFICATION_CONTEXT_DEFAULT: StateObject<IdentificationType> = [
  {
    user: null,
    users: {},
    permission: "guest",
  },
  () => {},
];
const MODAL_CONTEXT_DEFAULT: StateObject<ReactNode> = [false, () => {}];
const NAVBAR_CONTEXT_DEFAULT: StateObject<boolean> = [false, () => {}];
const SCREEN_CONTEXT_DEFAULT: ScreenSizeType = {
  width: 0,
  type: "mobile",
};
const TOAST_CONTEXT_DEFAULT: ToastContextPropsType = {
  toasts: [],
  setToasts: (newToasts) => {},
  addToast: (newToast) => {},
  addToastPreset: (newToast) => {},
};

export const IdentificationContext = createContext(IDENTIFICATION_CONTEXT_DEFAULT);
export const ModalContext = createContext(MODAL_CONTEXT_DEFAULT);
export const NavBarContext = createContext(NAVBAR_CONTEXT_DEFAULT);
export const ScreenContext = createContext(SCREEN_CONTEXT_DEFAULT);
export const ToastContext = createContext(TOAST_CONTEXT_DEFAULT);

interface ContextWrapperProps {
  children: ReactNode;
  stateIdentification: StateObject<IdentificationType>;
  stateModal: StateObject<ReactNode>;
  stateNavBar: StateObject<boolean>;
  toastProps: ToastContextPropsType;
  screen: ScreenSizeType;
}

export function ContextWrapper({
  children,
  stateIdentification,
  stateModal,
  stateNavBar,
  toastProps,
  screen,
}: ContextWrapperProps) {
  return (
    <IdentificationContext.Provider value={stateIdentification}>
      <ModalContext.Provider value={stateModal}>
        <ToastContext.Provider value={toastProps}>
          <NavBarContext.Provider value={stateNavBar}>
            <ScreenContext.Provider value={screen}>
              {children}
            </ScreenContext.Provider>
          </NavBarContext.Provider>
        </ToastContext.Provider>
      </ModalContext.Provider>
    </IdentificationContext.Provider>
  );
}
