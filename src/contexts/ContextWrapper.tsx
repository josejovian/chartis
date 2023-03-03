import { ReactNode } from "react";
import { ModalContext } from "./ModalContext";
import { NavBarContext } from "./NavBarContext";
import { ScreenContext } from "./ScreenContext";
import { IdentificationContext } from "./IdentificationContext";
import { ScreenSizeType, StateObject, IdentificationType } from "@/types";

export interface ContextWrapperProps {
  children: ReactNode;
  stateIdentification: StateObject<IdentificationType>;
  stateModal: StateObject<ReactNode>;
  stateNavBar: StateObject<boolean>;
  screen: ScreenSizeType;
}

export function ContextWrapper({
  children,
  stateIdentification,
  stateModal,
  stateNavBar,
  screen,
}: ContextWrapperProps) {
  return (
    <IdentificationContext.Provider value={stateIdentification}>
      <ModalContext.Provider value={stateModal}>
        <NavBarContext.Provider value={stateNavBar}>
          <ScreenContext.Provider value={screen}>
            {children}
          </ScreenContext.Provider>
        </NavBarContext.Provider>
      </ModalContext.Provider>
    </IdentificationContext.Provider>
  );
}
