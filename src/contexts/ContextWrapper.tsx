import { ReactNode } from "react";
import { ModalContext } from "./ModalContext";
import { NavBarContext } from "./NavBarContext";
import { ScreenContext } from "./ScreenContext";
import { UserContext } from "./UserContext";
import { ScreenSizeType, StateObject, UserType } from "@/types";

export interface ContextWrapperProps {
  children: ReactNode;
  identification: UserType;
  stateModal: StateObject<ReactNode>;
  stateNavBar: StateObject<boolean>;
  screen: ScreenSizeType;
}

export function ContextWrapper({
  children,
  identification,
  stateModal,
  stateNavBar,
  screen,
}: ContextWrapperProps) {
  return (
    <UserContext.Provider value={identification}>
      <ModalContext.Provider value={stateModal}>
        <NavBarContext.Provider value={stateNavBar}>
          <ScreenContext.Provider value={screen}>
            {children}
          </ScreenContext.Provider>
        </NavBarContext.Provider>
      </ModalContext.Provider>
    </UserContext.Provider>
  );
}
