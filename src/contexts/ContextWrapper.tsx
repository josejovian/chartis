import { ScreenSizeType, StateObject } from "@/types";
import { ReactNode } from "react";
import { ModalContext } from "./ModalContext";
import { NavBarContext } from "./NavBarContext";
import { ScreenContext } from "./ScreenContext";

export interface ContextWrapperProps {
  children: ReactNode;
  stateModal: StateObject<ReactNode>;
  stateNavBar: StateObject<boolean>;
  screen: ScreenSizeType;
}

export function ContextWrapper({
  children,
  stateModal,
  stateNavBar,
  screen,
}: ContextWrapperProps) {
  return (
    <ModalContext.Provider value={stateModal}>
      <NavBarContext.Provider value={stateNavBar}>
        <ScreenContext.Provider value={screen}>
          {children}
        </ScreenContext.Provider>
      </NavBarContext.Provider>
    </ModalContext.Provider>
  );
}
