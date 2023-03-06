import { ModalAuthLogin, ModalAuthRegister } from "@/components";
import { useCallback, useContext, useMemo } from "react";
import { ModalContext } from "@/contexts";

export function useModal() {
  const params = useContext(ModalContext);
  const setModal = params[1];

  const showRegister = useCallback(() => {
    setModal(<ModalAuthRegister />);
  }, [setModal]);

  const showLogin = useCallback(() => {
    setModal(<ModalAuthLogin />);
  }, [setModal]);

  const clearModal = useCallback(() => setModal(null), [setModal]);

  return useMemo(
    () => ({
      params,
      showRegister,
      showLogin,
      clearModal,
    }),
    [params, showRegister, showLogin, clearModal]
  );
}
