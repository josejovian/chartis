import { useMemo } from "react";
import { Button, SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { auth, logout } from "@/firebase";
import { LayoutNavbarButton, UserPicture } from "@/components";
import { useModal } from "@/hooks";

export interface LayoutNavbarAuthProps {
  name: string;
  icon: SemanticICONS;
  onClick?: () => void;
  visible?: boolean;
  active?: boolean;
}

export function LayoutNavbarAuth() {
  const user = auth.currentUser;
  const { showRegister, showLogin } = useModal();

  const renderUser = useMemo(
    () => (
      <>
        <div className="flex items-center gap-4">
          <UserPicture fullName="John Doe" />
          <span>{user?.uid}</span>
        </div>
        <LayoutNavbarButton
          icon="log out"
          className="text-red-200 hover:text-red-300 active:text-red-300 focus:text-red-300"
          onClick={() => {
            logout();
          }}
        />
      </>
    ),
    [user?.uid]
  );

  const renderGuest = useMemo(
    () => (
      <div className="w-full flex items-center justify-center gap-4">
        <Button size="tiny" onClick={showRegister}>
          Register
        </Button>
        <Button color="yellow" size="tiny" onClick={showLogin}>
          Login
        </Button>
      </div>
    ),
    [showLogin, showRegister]
  );

  return (
    <div
      className={clsx(
        "w-inherit h-12 py-2 px-4",
        "flex items-center justify-between",
        "text-white border-t border-slate-600"
      )}
    >
      {user ? renderUser : renderGuest}
    </div>
  );
}
