import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { fs, readData, updateData } from "@/firebase";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  ButtonDropdownSort,
  StickyHeaderTable,
  LayoutNotice,
  ModalConfirmation,
} from "@/components";
import { useAuthorization, useIdentification, useScreen } from "@/hooks";
import { strDateTime, validateEventQuery } from "@/utils";
import {
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  MODERATION_REPORT_SORT,
  MODERATION_REPORT_CATEGORY_FILTER,
  MODERATION_REPORT_CONTENT_TYPE,
  MODERATION_REPORT_CONTENT_TYPE_FILTER,
  MODERATION_REPORT_STATUS_FILTER_TYPE,
} from "@/consts";
import {
  DropdownSortOptionType,
  ReportExtendedType,
  ReportNameFilterType,
  ReportStatusFilterType,
  ReportStatusType,
  ReportType,
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

export function PageManageReports({ className }: PageManageReportsProps) {
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

  const stateModalDelete = useState(false);
  const [loading, setLoading] = useState(true);
  const stateQuery = useState("");
  const stateReportStatus = useState<ReportStatusFilterType>("all");
  const stateReportType = useState<ReportNameFilterType>("all");
  const stateSort = useState<DropdownSortOptionType<ReportType>>(
    MODERATION_REPORT_SORT[0]
  );
  const stateSortDescending = useState(false);

  const [query, setQuery] = stateQuery;
  const [reportStatus, setReportStatus] = stateReportStatus;
  const [reportType, setReportType] = stateReportType;
  const [sortBy, setSortBy] = stateSort;
  const [sortDescending, setSortDescending] = stateSortDescending;

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
    [sortBy]
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
            return (left - right) * (sortDescending ? -1 : 1);

          return 0;
        }),
    [data, reportStatus, reportType, sortBy.key, sortDescending]
  );

  const handleGetReports = useCallback(async () => {
    if (!isAuthorized && initialize.current) return;

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

    initialize.current = true;
    setLoading(false);
    setData(results);
  }, [isAuthorized]);

  const handleUpdateReportStatus = useCallback(
    async (id: string, status: ReportStatusType) => {
      if (!isAuthorized && initialize.current) return;

      setData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          status,
        },
      }));

      await updateData("reports", id, {
        status,
      }).catch(() => {
        setData((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: status === "open" ? "resolved" : "open",
          },
        }));
      });
    },
    [isAuthorized]
  );

  useEffect(() => {
    handleGetReports();
  }, [handleGetReports]);

  const modalDelete = useMemo(
    () => (
      <ModalConfirmation
        trigger={<span></span>}
        stateOpen={stateModalDelete}
        modalText="Are you sure you want to perform this action? This cannot be undone later."
        confirmText="Delete"
      />
    ),
    [stateModalDelete]
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
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 5,
        },
        headerName: "Author",
        key: "authorId",
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
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 4,
        },
        headerName: "Reported By",
        key: "reportedBy",
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
              onClick={() => {
                const reportId = data.id;
                if (reportId)
                  handleUpdateReportStatus(
                    reportId,
                    data.status === "resolved" ? "open" : "resolved"
                  );
              }}
            >
              {data.status === "resolved" ? "Reopen" : "Resolve"}
            </Button>
            <Button size="mini" color="red" icon={type !== "mobile"}>
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
    [handleUpdateReportStatus, type]
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

    localStorage.setItem(
      viewTypeString,
      JSON.stringify({
        reportStatus,
        reportType,
        query,
        sortBy: sortBy.id,
      })
    );
  }, [query, reportStatus, reportType, sortBy.id, viewTypeString]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = localStorage.getItem(viewTypeString);

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);

      const criteria = MODERATION_REPORT_SORT.filter(
        ({ id }) => id === parsedQuery.sortBy
      )[0];

      setReportStatus(parsedQuery.reportStatus);
      setReportType(parsedQuery.reportType);
      setQuery(parsedQuery.query);
      setSortBy(criteria);
      setSortDescending(criteria.descending);
    }

    queried.current++;
  }, [
    setQuery,
    setReportStatus,
    setReportType,
    setSortBy,
    setSortDescending,
    viewTypeString,
  ]);

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
          <ButtonDropdownSort
            options={MODERATION_REPORT_SORT}
            stateSortBy={stateSort}
            stateSortDescending={stateSortDescending}
            size={type === "mobile" ? "tiny" : undefined}
          />
        </div>
      </div>
    ),
    [
      type,
      stateQuery,
      stateReportStatus,
      stateReportType,
      stateSort,
      stateSortDescending,
    ]
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
        {modalDelete}
        {renderControls}
        <div className="my-6">{renderCaption}</div>
        {renderUserTable}
      </LayoutCard>
    ),
    [className, modalDelete, renderCaption, renderControls, renderUserTable]
  );

  return <>{!loading && renderPage}</>;
}
