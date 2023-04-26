import { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ModalReportProps } from "@/components";
import { useModal } from "./useModal";

const ModalReport = dynamic(
  () => import("../components/Modal/Moderation/ModalReport")
);

export function useReport(props: ModalReportProps) {
  const { setModal } = useModal();

  const showReportModal = useCallback(() => {
    setModal(<ModalReport {...props} />);
  }, [props, setModal]);

  return useMemo(
    () => ({
      showReportModal,
    }),
    [showReportModal]
  );
}
