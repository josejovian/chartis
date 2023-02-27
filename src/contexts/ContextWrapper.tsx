import { ReactNode } from "react";
import { User } from "firebase/auth";
import { ModalContext } from "./ModalContext";
import { NavBarContext } from "./NavBarContext";
import { ScreenContext } from "./ScreenContext";
import { UserContext } from "./UserContext";
import { ScreenSizeType, StateObject } from "@/types";

export interface ContextWrapperProps {
  children: ReactNode;
  user: User | null;
  stateModal: StateObject<ReactNode>;
  stateNavBar: StateObject<boolean>;
  screen: ScreenSizeType;
}

export function ContextWrapper({
  children,
  user,
  stateModal,
  stateNavBar,
  screen,
}: ContextWrapperProps) {
  return (
    <UserContext.Provider value={user}>
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
