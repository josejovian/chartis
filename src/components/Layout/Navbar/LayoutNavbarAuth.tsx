import { useCallback, useMemo } from "react";
import { Button, type SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { auth, logout } from "@/firebase";
import {
  LayoutNavbarButton,
  ModalAuthLogin,
  ModalAuthRegister,
} from "@/components";
import { useModal, useToast } from "@/hooks";
import { User } from "@/components/User/User";

export interface LayoutNavbarAuthProps {
  name: string;
  icon: SemanticICONS;
  onClick?: () => void;
  visible?: boolean;
  active?: boolean;
}

export function LayoutNavbarAuth() {
  const user = auth.currentUser;
  const { addToast } = useToast();
  const { setModal } = useModal();

  const handleShowLoginModal = useCallback(() => {
    setModal(<ModalAuthLogin />);
  }, [setModal]);

  const handleShowRegisterModal = useCallback(() => {
    setModal(<ModalAuthRegister />);
  }, [setModal]);

  const handleLogout = useCallback(async () => {
    await logout()
      .then(() => {
        addToast({
          title: "Logout Success",
          description: "See you!",
          variant: "success",
        });
      })
      .catch(() => {
        addToast({
          title: "Logout Failed",
          description: "Please try again later.",
          variant: "danger",
        });
      });
  }, [addToast]);

  const renderUser = useMemo(
    () =>
      user && (
        <>
          <User id={user.uid} type="all" />
          <LayoutNavbarButton
            icon="log out"
            className="text-red-200 hover:text-red-300 active:text-red-300 focus:text-red-300"
            onClick={handleLogout}
          />
        </>
      ),
    [handleLogout, user]
  );

  const renderGuest = useMemo(
    () => (
      <div className="w-full flex items-center justify-center gap-4">
        <Button size="tiny" onClick={handleShowRegisterModal}>
          Register
        </Button>
        <Button color="yellow" size="tiny" onClick={handleShowLoginModal}>
          Login
        </Button>
      </div>
    ),
    [handleShowLoginModal, handleShowRegisterModal]
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
