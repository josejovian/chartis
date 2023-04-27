import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ModalReportProps } from "@/components";
import { useModal } from "./useModal";
import { Loader } from "semantic-ui-react";

const ModalReport = dynamic(
  () => import("../components/Modal/Moderation/ModalReport"),
  {
    loading: () => <Loader>Loading</Loader>,
  }
);

export function useReport() {
  const { setModal } = useModal();

  const showReportModal = useCallback(
    (props: ModalReportProps) => {
      setModal(<ModalReport {...props} />);
    },
    [setModal]
  );

  return useMemo(
    () => ({
      showReportModal,
    }),
    [showReportModal]
  );
}
