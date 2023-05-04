import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  StickyHeaderTable,
  LayoutNotice,
  ModalConfirmation,
} from "@/components";
import {
  useAuthorization,
  useIdentification,
  useReport,
  useScreen,
  useToast,
} from "@/hooks";
import { sleep, strDateTime, validateEventQuery } from "@/utils";
import {
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  MODERATION_REPORT_SORT,
  MODERATION_REPORT_CATEGORY_FILTER,
  MODERATION_REPORT_CONTENT_TYPE,
  MODERATION_REPORT_CONTENT_TYPE_FILTER,
  MODERATION_REPORT_STATUS_FILTER_TYPE,
} from "@/consts";
import {
  ReportExtendedType,
  ReportNameFilterType,
  ReportSortType,
  ReportStatusFilterType,
  ReportStatusType,
  StickyHeaderTableColumnProps,
  StickyHeaderTableRowProps,
} from "@/types";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { Button, Icon, Label } from "semantic-ui-react";
import Link from "next/link";

export interface PageManageReportsProps {
  className?: string;
}

interface PageManageReportLoading {
  page: boolean;
  edit: boolean;
  delete: boolean;
}

export function PageManageReports({ className }: PageManageReportsProps) {
  const { addToast, addToastPreset } = useToast();
  const { stateIdentification } = useIdentification();
  const auth = getAuth();
  const router = useRouter();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    onFail: () => {
      router.replace("/");
    },
    permission: "admin",
  });
  const { type } = useScreen();
  const { deleteReport, getReports, updateReportStatus } = useReport();

  const stateModalDelete = useState(false);
  const setModalDelete = stateModalDelete[1];
  const deletedReport = useRef<string>();
  const stateLoading = useState<PageManageReportLoading>({
    page: true,
    edit: false,
    delete: false,
  });
  const [loading, setLoading] = stateLoading;
  const stateQuery = useState("");
  const stateReportStatus = useState<ReportStatusFilterType>("all");
  const stateReportType = useState<ReportNameFilterType>("all");
  const stateSort = useState<ReportSortType>("newest");

  const [query, setQuery] = stateQuery;
  const [reportStatus, setReportStatus] = stateReportStatus;
  const [reportType, setReportType] = stateReportType;
  const [sort, setSort] = stateSort;
  const sortBy = useMemo(() => MODERATION_REPORT_SORT[sort], [sort]);

  const setLoadingState = useCallback(
    (name: keyof PageManageReportLoading, state: boolean) => {
      setLoading((prev) => ({
        ...prev,
        [name]: state,
      }));
    },
    [setLoading]
  );

  const filterCaption = useMemo(
    () => (
      <>
        {(reportStatus !== "all" || reportType !== "all") && "Filtered by "}
        {reportStatus !== "all" && (
          <b>&nbsp;{MODERATION_REPORT_STATUS_FILTER_TYPE[reportStatus].name}</b>
        )}
        {reportType !== "all" && (
          <b>&nbsp;{MODERATION_REPORT_CONTENT_TYPE[reportType].name}</b>
        )}
        {reportStatus === "all" && reportType === "all" && "No filters active"}
      </>
    ),
    [reportStatus, reportType]
  );
  const sortCaption = useMemo(
    () => (
      <>
        {" "}
        , sorted by <b>{sortBy.name}</b>.
      </>
    ),
    [sortBy.name]
  );
  const renderCaption = useMemo(
    () => (
      <>
        {!validateEventQuery(query) &&
          `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0]}-${EVENT_QUERY_LENGTH_CONSTRAINTS[1]} characters. `}
        {query !== "" ? (
          <>
            Searching for {query}.{filterCaption}
          </>
        ) : (
          filterCaption
        )}
        {sortCaption}
      </>
    ),
    [filterCaption, query, sortCaption]
  );

  const [data, setData] = useState<Record<string, ReportExtendedType>>({});
  const initialize = useRef(false);

  const filteredData = useMemo(
    () =>
      Object.values(data)
        .filter(({ contentType, status = "open" }) => {
          if (reportType !== "all" && reportStatus !== "all")
            return contentType === reportType && status === reportStatus;
          if (reportType !== "all") return contentType === reportType;
          if (reportStatus !== "all") return status === reportStatus;
          return true;
        })
        .sort((a, b) => {
          const left = a[sortBy.key as keyof ReportExtendedType] ?? 0;
          const right = b[sortBy.key as keyof ReportExtendedType] ?? 0;
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortBy.descending ? -1 : 1);

          return 0;
        }),
    [data, reportType, reportStatus, sortBy.key, sortBy.descending]
  );

  const handleGetReports = useCallback(async () => {
    if (!isAuthorized && initialize.current) return;

    const results = await getReports({
      onSuccess: () => {
        initialize.current = true;
        setLoadingState("page", false);
      },
      onFail: () => {
        addToastPreset("get-fail");
      },
    });

    setData(results);
  }, [addToastPreset, getReports, isAuthorized, setLoadingState]);

  useEffect(() => {
    handleGetReports();
  }, [handleGetReports]);

  const handleUpdateReport = useCallback(
    async (id: string, status: ReportStatusType) => {
      if (!isAuthorized && initialize.current) return;

      setLoadingState("edit", true);
      setData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status,
        },
      }));
      await sleep(200);
      await updateReportStatus({
        id,
        status,
        onSuccess: async () => {
          await sleep(200);
          setLoadingState("edit", false);
          addToast({
            title: "Report Updated",
            description: `Report is successfully marked as ${status}.`,
            variant: "success",
          });
        },
        onFail: () => {
          setData((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              status: status === "resolved" ? "open" : "resolved",
            },
          }));
          setLoadingState("edit", false);
          addToastPreset("post-fail");
        },
      });
    },
    [
      addToast,
      addToastPreset,
      isAuthorized,
      setLoadingState,
      updateReportStatus,
    ]
  );

  const handleDeleteReport = useCallback(async () => {
    if (!isAuthorized && initialize.current) return;

    const id = deletedReport.current;
    if (!id) return;

    setLoadingState("delete", true);
    setData((prev) => {
      const temp = { ...prev };
      delete temp[id];
      return temp;
    });

    await sleep(200);
    await deleteReport({
      id,
      onSuccess: async () => {
        await sleep(200);
        setLoadingState("delete", false);
        setModalDelete(false);
        addToast({
          title: "Report Deleted",
          description: "Report is successfully deleted.",
          variant: "success",
        });
      },
      onFail: () => {
        setLoadingState("delete", false);
        addToastPreset("post-fail");
      },
    });
  }, [
    isAuthorized,
    setLoadingState,
    deleteReport,
    setModalDelete,
    addToast,
    addToastPreset,
  ]);

  const renderModalDelete = useMemo(
    () => (
      <ModalConfirmation
        trigger={<span></span>}
        stateOpen={stateModalDelete}
        loading={loading.delete}
        modalText="Are you sure you want to perform this action? This cannot be undone later."
        confirmText="Delete"
        onConfirm={handleDeleteReport}
      />
    ),
    [handleDeleteReport, loading.delete, stateModalDelete]
  );

  const manageReportTableColumns = useMemo<
    StickyHeaderTableColumnProps<ReportExtendedType>[]
  >(
    () => [
      {
        cellElement: ({ content, eventId, contentType }) =>
          contentType === "comment" ? (
            content
          ) : (
            <Link href={`/event/${eventId}`}>
              <Icon name="calendar" /> {content.name}
            </Link>
          ),
        cellProps: ({ contentType }) => ({
          className: clsx(
            contentType === "comment"
              ? "italic"
              : "text-blue-500 hover:text-blue-600 font-bold"
          ),
        }),
        cellWidth: {
          desktop_lg: 3,
          desktop_sm: 3,
          mobile: 5,
        },
        headerName: "Content",
        important: true,
      },
      {
        cellElement: ({ authorId }) => <>{authorId ?? "Unknown User"}</>,
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 5,
        },
        headerName: "Author",
        important: true,
      },
      {
        cellElement: ({ category, reason }) => (
          <>
            <Label circular>
              {category && MODERATION_REPORT_CATEGORY_FILTER[category].name}
            </Label>{" "}
            {reason}
          </>
        ),
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 4,
        },
        headerName: "Reason",
        important: true,
      },
      {
        cellElement: ({ reportedBy }) => (
          <>
            {type === "mobile" && <b>Reported by: </b>}
            {reportedBy ?? "Unknown User"}
          </>
        ),
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 4,
        },
        headerName: "Reported By",
        important: true,
      },
      {
        cellElement: (data) => strDateTime(new Date(data.date ?? 0)),
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 4,
        },
        headerName: "Date",
        important: true,
      },
      {
        cellElement: (data) => (
          <div className="flex flex-row gap-2">
            <Button
              size="mini"
              color={data.status === "resolved" ? "yellow" : "green"}
              icon={type !== "mobile"}
              onClick={() =>
                data.id &&
                handleUpdateReport(
                  data.id,
                  data.status === "resolved" ? "open" : "resolved"
                )
              }
            >
              {data.status === "resolved" ? "Reopen" : "Resolve"}
            </Button>
            <Button
              basic
              size="mini"
              color="red"
              icon={type !== "mobile"}
              onClick={() => {
                deletedReport.current = data.id;
                setModalDelete(true);
              }}
            >
              <Icon name="trash" /> {type === "mobile" && "Delete"}
            </Button>
          </div>
        ),
        cellWidth: {
          desktop_lg: 3,
          desktop_sm: 3,
          mobile: 3,
        },
        headerName: "Actions",
        important: true,
      },
    ],
    [handleUpdateReport, setModalDelete, type]
  );

  const manageReportTableRows = useCallback<
    StickyHeaderTableRowProps<ReportExtendedType>
  >(
    (datum) => ({
      className: clsx(datum.status === "resolved" && "bg-green-50"),
    }),
    []
  );

  const queried = useRef(0);
  const viewTypeString = useMemo(() => `query-manageReports`, []);

  const handleUpdatePathQueries = useCallback(() => {
    if (queried.current <= 1) return;

    sessionStorage.setItem(
      viewTypeString,
      JSON.stringify({
        reportStatus,
        reportType,
        query,
        sort,
      })
    );
  }, [query, reportStatus, reportType, sort, viewTypeString]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = sessionStorage.getItem(viewTypeString);

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);
      setReportStatus(parsedQuery.reportStatus);
      setReportType(parsedQuery.reportType);
      setQuery(parsedQuery.query);
      setSort(parsedQuery.sort);
    }

    queried.current++;
  }, [setQuery, setReportStatus, setReportType, setSort, viewTypeString]);

  useEffect(() => {
    handleUpdatePathQueries();
  }, [stateQuery, stateSort, handleUpdatePathQueries]);

  useEffect(() => {
    handleGetPathQuery();
  }, [handleGetPathQuery]);

  const renderControls = useMemo(
    () => (
      <div
        className={clsx(
          "flex gap-4",
          type === "mobile" ? "flex-col" : "flex-row"
        )}
      >
        <TemplateSearchInput
          placeholder="Search reports..."
          stateQuery={stateQuery}
        />
        <div className="flex grow-0 gap-4 justify-end">
          <ButtonDropdownSelect
            name="Category"
            stateActive={stateReportStatus}
            options={MODERATION_REPORT_STATUS_FILTER_TYPE}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
          <ButtonDropdownSelect
            name="Content Type"
            stateActive={stateReportType}
            options={MODERATION_REPORT_CONTENT_TYPE_FILTER}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
          <ButtonDropdownSelect
            name="Sort"
            options={MODERATION_REPORT_SORT}
            type="single"
            stateActive={stateSort}
            size={type === "mobile" ? "tiny" : undefined}
          />
        </div>
      </div>
    ),
    [type, stateQuery, stateReportStatus, stateReportType, stateSort]
  );

  const renderUserTable = useMemo(
    () => (
      <StickyHeaderTable
        name="ManageReport"
        emptyElement={
          <LayoutNotice
            title="No Reports"
            description="No reports matched such query."
            illustration="/no-users.png"
          />
        }
        type={type}
        data={filteredData}
        columns={manageReportTableColumns}
        rowProps={manageReportTableRows}
      />
    ),
    [filteredData, manageReportTableColumns, manageReportTableRows, type]
  );

  const renderPage = useMemo(
    () => (
      <LayoutCard className={className}>
        {renderModalDelete}
        {renderControls}
        <div className="my-6">{renderCaption}</div>
        {renderUserTable}
      </LayoutCard>
    ),
    [
      className,
      renderModalDelete,
      renderCaption,
      renderControls,
      renderUserTable,
    ]
  );

  return <>{!loading.page && renderPage}</>;
}
