import { useMemo } from "react";
import { Button, SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { auth } from "@/firebase";
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
  const { showRegister } = useModal();

  const renderUser = useMemo(
    () => (
      <>
        <div className="flex items-center gap-4">
          <UserPicture fullName="John Doe" />
          <span>John Doe</span>
        </div>
        <LayoutNavbarButton
          icon="log out"
          className="text-red-200 hover:text-red-300 active:text-red-300 focus:text-red-300"
          onClick={() => {
            console.log("Log Out");
          }}
        />
      </>
    ),
    []
  );

  const renderGuest = useMemo(
    () => (
      <div className="w-full flex items-center justify-center gap-4">
        <Button size="tiny" onClick={showRegister}>
          Register
        </Button>
        <Button color="yellow" size="tiny">
          Login
        </Button>
      </div>
    ),
    [showRegister]
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
