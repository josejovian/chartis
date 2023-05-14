import React, { useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { ModalReportProps } from "@/components";
import { useModal } from "./useModal";
import { Loader } from "semantic-ui-react";
import { collection, getDocs } from "firebase/firestore";
import { fs } from "@/firebase";
import { deleteData, readData, updateData } from "@/utils";
import { ReportExtendedType, ReportStatusType, ReportType } from "@/types";

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

  const getReports = useCallback(
    async ({
      onSuccess,
      onFail,
    }: {
      onSuccess?: () => void;
      onFail?: () => void;
    }) => {
      try {
        const docs = await getDocs(collection(fs, "reports"));
        const results: Record<string, ReportExtendedType> = {};

        const arrayDocs: ReportType[] = [];

        docs.forEach((doc) => {
          const result = doc.data();

          if (result)
            arrayDocs.push({
              ...result,
              id: doc.id,
            } as ReportType);
        });

        for (const doc of arrayDocs) {
          const { id, eventId, contentType } = doc;
          if (id) {
            let content = null;

            if (contentType === "comment") {
              const { commentId } = doc;
              await readData("comments", eventId).then((res) => {
                if (res) {
                  content = res[commentId].text;
                }
              });
            } else if (contentType === "event") {
              await readData("events", eventId).then((res) => {
                if (res) content = res;
              });
            }

            if (content) {
              results[id] = {
                ...doc,
                content,
              };
            }
          }
        }

        onSuccess && onSuccess();
        return results;
      } catch (e) {
        onFail && onFail();
        return {};
      }
    },
    []
  );

  const updateReportStatus = useCallback(
    async ({
      id,
      status,
      onSuccess,
      onFail,
    }: {
      id: string;
      status: ReportStatusType;
      onSuccess?: () => void;
      onFail?: () => void;
    }) => {
      return updateData("reports", id, {
        status,
      })
        .then(() => {
          onSuccess && onSuccess();
        })
        .catch(() => {
          onFail && onFail();
        });
    },
    []
  );

  const deleteReport = useCallback(
    async ({
      id,
      onSuccess,
      onFail,
    }: {
      id: string;
      onSuccess?: () => void;
      onFail?: () => void;
    }) => {
      return deleteData("reports", id)
        .then(() => {
          onSuccess && onSuccess();
        })
        .catch(() => {
          onFail && onFail();
        });
    },
    []
  );

  return useMemo(
    () => ({
      showReportModal,
      getReports,
      deleteReport,
      updateReportStatus,
    }),
    [deleteReport, getReports, updateReportStatus, showReportModal]
  );
}
