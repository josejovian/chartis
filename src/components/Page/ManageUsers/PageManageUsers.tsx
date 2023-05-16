import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { fs } from "@/firebase";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  StickyHeaderTable,
  LayoutNotice,
  User,
} from "@/components";
import { useScreen, useToast } from "@/hooks";
import { sleep, strDateTime, validateEventQuery, updateData } from "@/utils";
import {
  MODERATION_USER_SORT,
  MODERATION_USER_TYPE_FILTERS,
  EVENT_QUERY_LENGTH_CONSTRAINTS,
} from "@/consts";
import {
  StickyHeaderTableColumnProps,
  StickyHeaderTableRowProps,
  UserGroupFilterType,
  UserSortType,
  UserType,
} from "@/types";

export interface PageManageUsersProps {
  className?: string;
  isAuthorized?: boolean;
}

export function PageManageUsers({
  className,
  isAuthorized,
}: PageManageUsersProps) {
  const { addToastPreset } = useToast();

  const { type } = useScreen();
  const [loading, setLoading] = useState(true);
  const stateQuery = useState("");
  const stateUserType = useState<UserGroupFilterType>("all");
  const stateSort = useState<UserSortType>("newest");

  const [query, setQuery] = stateQuery;
  const [userType, setUserType] = stateUserType;
  const [sort, setSort] = stateSort;
  const sortBy = useMemo(() => MODERATION_USER_SORT[sort], [sort]);

  const filterCaption = useMemo(
    () => (
      <>
        &nbsp;who are <b>{MODERATION_USER_TYPE_FILTERS[userType].name}</b>
      </>
    ),
    [userType]
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
          `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0] + 1}-${
            EVENT_QUERY_LENGTH_CONSTRAINTS[1]
          } characters. `}
        {query !== "" ? (
          <>
            Searching for {query}
            {userType !== "all" && filterCaption}
          </>
        ) : (
          <>
            Filtering by <b>{MODERATION_USER_TYPE_FILTERS[userType].name}</b>
          </>
        )}
        {sortCaption}
      </>
    ),
    [filterCaption, query, sortCaption, userType]
  );

  const [data, setData] = useState<Record<string, UserType>>({});
  const [processing, setProcessing] = useState(false);
  const initialize = useRef(false);

  const filteredData = useMemo(
    () =>
      Object.values(data)
        .filter(({ name, ban, role = "user" }) => {
          if (query !== "")
            return name.toLowerCase().includes(query.toLowerCase());
          if (userType !== "banned")
            return userType === "all" || role === userType;
          if (userType === "banned") return ban;
          return true;
        })
        .sort((a, b) => {
          const left = a[sortBy.key] ?? 0;
          const right = b[sortBy.key] ?? 0;
          if (typeof left === "number" && typeof right === "number")
            return (left - right) * (sortBy.descending ? -1 : 1);

          if (typeof a[sortBy.key] === "string") {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1 * (sortBy.descending ? -1 : 1);
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1 * (sortBy.descending ? -1 : 1);
            }
          }
          return 0;
        }),
    [data, query, userType, sortBy.key, sortBy.descending]
  );

  const handleToggleBanUser = useCallback(
    async (userId: string, isBanned: boolean) => {
      if (processing) return;

      setProcessing(true);
      await sleep(200);
      setData((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          ban: !isBanned,
        },
      }));

      await updateData("users", userId, {
        ban: !isBanned,
      })
        .then(async () => {
          await sleep(200);
          setProcessing(false);
          addToastPreset(!isBanned ? "feat-user-ban" : "feat-user-unban");
        })
        .catch(() => {
          setProcessing(false);
          addToastPreset("fail-post");
          setData((prev) => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              ban: isBanned,
            },
          }));
        });
    },
    [addToastPreset, processing]
  );

  const handleGetUsers = useCallback(async () => {
    if (!isAuthorized || initialize.current) return;

    const docs = await getDocs(collection(fs, "users"));
    const results: Record<string, UserType> = {};

    docs.forEach((doc) => {
      const result = doc.data();

      if (result)
        results[doc.id] = {
          id: doc.id,
          ...result,
        } as UserType;
    });

    initialize.current = true;
    setData(results);
    setLoading(false);
  }, [isAuthorized]);

  const queried = useRef(0);
  const viewTypeString = useMemo(() => `query-manageUser`, []);

  const handleUpdatePathQueries = useCallback(() => {
    if (queried.current <= 1) return;

    sessionStorage.setItem(
      viewTypeString,
      JSON.stringify({
        userType,
        query,
        sort,
      })
    );
  }, [query, sort, userType, viewTypeString]);

  const handleGetPathQuery = useCallback(() => {
    const rawQuery = sessionStorage.getItem(viewTypeString);

    if (rawQuery && queried.current <= 1) {
      const parsedQuery = JSON.parse(rawQuery);

      setUserType(parsedQuery.userType);
      setQuery(parsedQuery.query);
      setSort(parsedQuery.sort);
    }

    queried.current++;
  }, [setQuery, setSort, setUserType, viewTypeString]);

  useEffect(() => {
    handleUpdatePathQueries();
  }, [stateQuery, stateSort, handleUpdatePathQueries]);

  useEffect(() => {
    handleGetPathQuery();
  }, [handleGetPathQuery]);

  useEffect(() => {
    handleGetUsers();
  }, [handleGetUsers]);

  const manageUserTableColumns = useMemo<
    StickyHeaderTableColumnProps<UserType>[]
  >(
    () => [
      {
        cellElement: (data) => <User defaultUser={data} type="name" showRole />,
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 4,
        },
        headerName: "Name",
        important: true,
      },
      {
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 4,
        },
        headerName: "E-mail",
        key: "email",
        important: true,
      },
      {
        cellElement: (data) => strDateTime(new Date(data.joinDate ?? 0)),

        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 4,
        },
        headerName: "Join Date",
        important: true,
      },
      {
        cellElement: (data) => (
          <>
            {data.ban ? (
              <Button
                size="mini"
                color="yellow"
                onClick={() =>
                  data.id && handleToggleBanUser(data.id, data.ban ?? false)
                }
              >
                Unban
              </Button>
            ) : (
              <Button
                size="mini"
                color="red"
                disabled={data.role === "admin"}
                onClick={() =>
                  data.role !== "admin" &&
                  data.id &&
                  handleToggleBanUser(data.id, data.ban ?? false)
                }
              >
                Ban
              </Button>
            )}
          </>
        ),
        cellWidth: {
          desktop_lg: 4,
          desktop_sm: 4,
          mobile: 4,
        },
        headerName: "Actions",
        important: true,
      },
    ],
    [handleToggleBanUser]
  );

  const manageUserTableRows = useCallback<StickyHeaderTableRowProps<UserType>>(
    (datum) => ({
      className: clsx(datum.ban && "bg-red-50"),
    }),
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
          placeholder="Search users..."
          stateQuery={stateQuery}
        />
        <div className="flex grow-0 gap-4 justify-end">
          <ButtonDropdownSelect
            name="Filter"
            stateActive={stateUserType}
            options={MODERATION_USER_TYPE_FILTERS}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
          <ButtonDropdownSelect
            name="Sort"
            options={MODERATION_USER_SORT}
            stateActive={stateSort}
            size={type === "mobile" ? "tiny" : undefined}
            type="single"
          />
        </div>
      </div>
    ),
    [stateQuery, stateSort, stateUserType, type]
  );

  const renderUserTable = useMemo(
    () => (
      <StickyHeaderTable
        name="ManageUser"
        emptyElement={
          <LayoutNotice
            title="No Users"
            description="No users matched such query."
            illustration="/no-users.png"
          />
        }
        type={type}
        data={filteredData}
        columns={manageUserTableColumns}
        rowProps={manageUserTableRows}
      />
    ),
    [filteredData, manageUserTableColumns, manageUserTableRows, type]
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
