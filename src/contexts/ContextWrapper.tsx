import { ReactNode } from "react";
import {
  ScreenSizeType,
  StateObject,
  IdentificationType,
  ToastContextPropsType,
} from "@/types";
import { ModalContext } from "./ModalContext";
import { NavBarContext } from "./NavBarContext";
import { ScreenContext } from "./ScreenContext";
import { IdentificationContext } from "./IdentificationContext";
import { ToastContext } from "./ToastContext";

export interface ContextWrapperProps {
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
