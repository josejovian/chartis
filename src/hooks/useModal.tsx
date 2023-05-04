import { useCallback, useContext, useMemo } from "react";
import { ModalContext } from "@/contexts";

export function useModal() {
  const stateModal = useContext(ModalContext);
  const [modal, setModal] = stateModal;

  const clearModal = useCallback(() => setModal(null), [setModal]);

  return useMemo(
    () => ({
      modal,
      setModal,
      clearModal,
    }),
    [modal, setModal, clearModal]
  );
}
