/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo, useState } from "react";
import { createData } from "@/firebase";
import { FormErrorMessage, FormInputDropdown } from "@/components";
import { useModal, useScreen, useToast } from "@/hooks";
import { SchemaReport, sleep } from "@/utils";
import {
  CommentReportType,
  ReportCategoryType,
  ReportType,
  ResponsiveStyleType,
} from "@/types";
import { Field, Formik } from "formik";
import { Button, Form, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import { MODERATION_REPORT_CATEGORY } from "@/consts";
import pushid from "pushid";

export type ModalReportProps = Omit<ReportType, "category" | "reason">;

export default function ModalReport(props: ModalReportProps) {
  const { authorId, reportedBy, contentType, eventId } = props;

  const { clearModal } = useModal();
  const { addToastPreset } = useToast();
  const { type } = useScreen();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportType>({
    status: "open",
    authorId,
    reportedBy,
    eventId,
    reason: "",
    ...(contentType === "comment"
      ? {
          contentType: "comment",
          commentId: (props as unknown as CommentReportType).commentId,
        }
      : {
          contentType: "event",
        }),
  });

  const labelStyle = useMemo(
    () => clsx(INPUT_LABEL_BASE_STYLE, RESPONSIVE_WIDTH_STYLE[type]),
    [type]
  );

  const handleSubmitReport = useCallback(
    async (values: unknown) => {
      const { reason } = values as ReportType;

      const finalReport: ReportType = {
        ...report,
        reason,
        date: new Date().getTime(),
      };

      setLoading(true);

      const reportId = pushid();

      await createData("reports", finalReport, reportId)
        .then(async () => {
          await sleep(200);
          clearModal();
          addToastPreset("feat-report-create");
        })
        .catch(() => {
          setLoading(false);
          addToastPreset("fail-post");
        });
    },
    [addToastPreset, clearModal, report]
  );

  const handleValidateCategory = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!report.category) errors.category = "Category is required.";
    return errors;
  }, [report.category]);

  const renderFormHead = useMemo(
    () => (
      <div className="flex flex-col items-center bg-white mb-8">
        <h2 className="text-20px">Report</h2>
      </div>
    ),
    []
  );

  const renderInputReportCategory = useCallback(
    ({ validateForm }: { validateForm?: () => void }) => (
      <>
        <label className={labelStyle} htmlFor="category">
          Report Category
        </label>
        <FormInputDropdown
          fieldName="category"
          className=""
          placeholder="Choose report category"
          options={Object.entries(MODERATION_REPORT_CATEGORY).map(
            ([id, { name }]) => ({
              key: `SelectCategory_${id}`,
              text: name,
              value: id,
            })
          )}
          onChange={(_, { value }) =>
            setReport((prev) => ({
              ...prev,
              category: value as ReportCategoryType,
            }))
          }
          formErrorMessageProps={{
            className: clsx(
              "text-right text-16px mt-2",
              RESPONSIVE_WIDTH_STYLE[type]
            ),
          }}
          validateForm={validateForm}
        />
      </>
    ),
    [labelStyle, type]
  );

  const renderInputReportReason = useMemo(
    () => (
      <>
        <label className={clsx(labelStyle, "mt-2.5")} htmlFor="category">
          Report Reason
        </label>
        <Field name="reason">
          {({ field, meta }: any) => (
            <div className={clsx(RESPONSIVE_WIDTH_STYLE[type])}>
              <TextArea
                className="w-full b-0 !text-16px mb-4"
                transparent
                style={{
                  resize: "none",
                  lineHeight: "1.25rem",
                  height: "4rem",
                  border: "0!important",
                }}
                placeholder="Explain the reason"
                fluid
                {...field}
              />
              <FormErrorMessage meta={meta} className="text-right mt-2" />
            </div>
          )}
        </Field>
      </>
    ),
    [labelStyle, type]
  );

  const renderFormBody = useMemo(
    () => (
      <Formik
        initialValues={{
          category: undefined,
          reason: "",
        }}
        validationSchema={SchemaReport}
        validate={handleValidateCategory}
        onSubmit={handleSubmitReport}
      >
        {({ validateForm, submitForm }) => (
          <Form
            className={clsx(
              RESPONSIVE_WIDTH_STYLE[type],
              "flex flex-col items-center bg-white"
            )}
          >
            {renderInputReportCategory({ validateForm })}
            {renderInputReportReason}
            <Button
              className="!mt-2"
              type="submit"
              color="yellow"
              loading={loading}
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    ),
    [
      handleSubmitReport,
      handleValidateCategory,
      loading,
      renderInputReportCategory,
      renderInputReportReason,
      type,
    ]
  );

  return (
    <div className="flex flex-col items-center">
      {renderFormHead}
      {renderFormBody}
    </div>
  );
}

export const RESPONSIVE_WIDTH_STYLE: ResponsiveStyleType = {
  desktop_lg: "w-80",
  desktop_sm: "w-80",
  mobile: "w-full",
};

export const INPUT_LABEL_BASE_STYLE = "font-black text-left mb-2";
