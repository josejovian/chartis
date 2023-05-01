import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { fs } from "@/firebase";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  ButtonDropdownSort,
  StickyHeaderTable,
  LayoutNotice,
} from "@/components";
import { useAuthorization, useIdentification, useScreen } from "@/hooks";
import { strDateTime, validateEventQuery } from "@/utils";
import {
  EVENT_QUERY_LENGTH_CONSTRAINTS,
  MODERATION_REPORT_SORT,
  MODERATION_REPORT_FILTER_CATEGORY,
  MODERATION_REPORT_CONTENT_TYPE,
} from "@/consts";
import {
  DropdownSortOptionType,
  ReportCategoryType,
  ReportNameType,
  ReportType,
  StickyHeaderTableColumnProps,
} from "@/types";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";

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
      router.push("/");
    },
    permission: "admin",
  });
  const { type } = useScreen();

  const [loading, setLoading] = useState(true);
  const stateQuery = useState("");
  const stateReportCategory = useState<ReportCategoryType>("all");
  const stateReportType = useState<ReportNameType>("all");
  const stateSort = useState<DropdownSortOptionType<ReportType>>(
    MODERATION_REPORT_SORT[0]
  );
  const stateSortDescending = useState(false);

  const query = stateQuery[0];
  const [reportCategory] = stateReportCategory;
  const [reportType] = stateReportType;
  const [sortBy] = stateSort;
  const [sortDescending] = stateSortDescending;

  const filterCaption = useMemo(
    () => (
      <>
        {(reportCategory !== "all" || reportType !== "all") && ", filtered by"}
        {reportCategory !== "all" && (
          <b>&nbsp;{MODERATION_REPORT_FILTER_CATEGORY[reportCategory].name}</b>
        )}
        {reportType !== "all" && (
          <b>&nbsp;{MODERATION_REPORT_CONTENT_TYPE[reportType].name}</b>
        )}
      </>
    ),
    [reportCategory, reportType]
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
  const mainCaption = useMemo(() => `Searching for "${query}"`, [query]);
  const renderCaption = useMemo(
    () =>
      validateEventQuery(query) && query !== "" ? (
        <>
          {mainCaption}
          {filterCaption}
          {sortCaption}
        </>
      ) : (
        `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0]}-${EVENT_QUERY_LENGTH_CONSTRAINTS[1]} characters.`
      ),
    [filterCaption, mainCaption, query, sortCaption]
  );

  const [data, setData] = useState<Record<string, ReportType>>({});
  const initialize = useRef(false);

  const filteredData = useMemo(
    () =>
      Object.values(data)
        .filter(({ contentType, category }) => {
          if (reportType !== "all") return contentType === reportType;
          if (reportCategory !== "all") return category === reportCategory;
          return true;
        })
        .sort((a, b) => {
          const left = a[sortBy.key] ?? 0;
          const right = b[sortBy.key] ?? 0;
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortDescending ? -1 : 1);

          return 0;
        }),
    [data, reportCategory, reportType, sortBy.key, sortDescending]
  );

  const handleGetReports = useCallback(async () => {
    if (!isAuthorized && initialize.current) return;

    const docs = await getDocs(collection(fs, "reports"));
    const results: Record<string, ReportType> = {};

    docs.forEach((doc) => {
      const result = doc.data();

      if (result) results[doc.id] = result as ReportType;
    });

    initialize.current = true;
    setLoading(false);
    setData(results);
  }, [isAuthorized]);

  useEffect(() => {
    handleGetReports();
  }, [handleGetReports]);

  const manageUserTableColumns = useMemo<
    StickyHeaderTableColumnProps<ReportType>[]
  >(
    () => [
      {
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 5,
        },
        headerName: "Author",
        key: "authorId",
        important: true,
      },
      {
        cellElement: ({ category }) =>
          category && MODERATION_REPORT_FILTER_CATEGORY[category].name,
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 4,
        },
        headerName: "Category",
        important: true,
      },
      {
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
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
        cellElement: (data) => data.status ?? "Open",
        cellWidth: {
          desktop_lg: 2,
          desktop_sm: 2,
          mobile: 3,
        },
        headerName: "Status",
        important: true,
      },
    ],
    []
  );

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
            stateActive={stateReportCategory}
            options={MODERATION_REPORT_FILTER_CATEGORY}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
          <ButtonDropdownSelect
            name="Content Type"
            stateActive={stateReportType}
            options={MODERATION_REPORT_CONTENT_TYPE}
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
      stateReportCategory,
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
        columns={manageUserTableColumns}
      />
    ),
    [filteredData, manageUserTableColumns, type]
  );

  const renderPage = useMemo(
    () => (
      <LayoutCard className={className}>
        {renderControls}
        <div className="my-6">{renderCaption}</div>
        {renderUserTable}
      </LayoutCard>
    ),
    [className, renderCaption, renderControls, renderUserTable]
  );

  return <>{!loading && renderPage}</>;
}
