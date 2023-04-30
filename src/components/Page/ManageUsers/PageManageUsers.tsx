import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  ButtonDropdownSort,
  LayoutNotice,
} from "@/components";
import { useIdentification, useScreen, useToast } from "@/hooks";
import { Button, Icon, Table } from "semantic-ui-react";
import { DropdownSortOptionType, UserGroupFilterType, UserType } from "@/types";
import { collection, getDocs } from "firebase/firestore";
import { fs, updateData } from "@/firebase";
import { sleep, strDateTime, validateEventQuery } from "@/utils";
import {
  MODERATION_USER_SORT,
  MODERATION_USER_TYPE_FILTERS,
} from "@/consts/moderation";
import { EVENT_QUERY_LENGTH_CONSTRAINTS } from "@/consts";

export interface PageManageUsersProps {
  className?: string;
}

export function PageManageUsers({ className }: PageManageUsersProps) {
  const { stateIdentification } = useIdentification();
  const [{ user, users }] = stateIdentification;
  const [loading] = useState(true);
  const { type } = useScreen();

  const { addToast, addToastPreset } = useToast();
  const stateQuery = useState("");
  const query = stateQuery[0];
  const stateUserType = useState<UserGroupFilterType>("all");
  const [userType] = stateUserType;
  const stateSort = useState<DropdownSortOptionType<UserType>>(
    MODERATION_USER_SORT[0]
  );
  const [sortBy] = stateSort;

  const stateSortDescending = useState(false);
  const [sortDescending] = stateSortDescending;

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

  const mainCaption = useMemo(() => `Searching for "${query}" `, [query]);

  const renderCaption = useMemo(
    () =>
      validateEventQuery(query) && query !== "" ? (
        <>
          {mainCaption}
          {userType !== "all" && filterCaption}
          {sortCaption}
        </>
      ) : (
        `Search query must be ${EVENT_QUERY_LENGTH_CONSTRAINTS[0]}-${EVENT_QUERY_LENGTH_CONSTRAINTS[1]} characters.`
      ),
    [filterCaption, mainCaption, query, sortCaption, userType]
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
            return (left - right) * (sortDescending ? -1 : 1);

          if (typeof a[sortBy.key] === "string") {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
              return -1 * (sortDescending ? -1 : 1);
            }
            if (a.name.toLowerCase() > b.name.toLowerCase()) {
              return 1 * (sortDescending ? -1 : 1);
            }
          }
          return 0;
        }),
    [data, query, userType, sortBy.key, sortDescending]
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
          addToast(
            !isBanned
              ? {
                  title: "User Banned",
                  description: "User has been banned.",
                  variant: "success",
                }
              : {
                  title: "User Unbanned",
                  description: "User has been unbanned.",
                  variant: "success",
                }
          );
        })
        .catch(() => {
          setProcessing(false);
          addToastPreset("post-fail");
          setData((prev) => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              ban: isBanned,
            },
          }));
        });
    },
    [addToast, addToastPreset, processing]
  );

  const handleGetUsers = useCallback(async () => {
    if (initialize.current) return;

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
  }, []);

  const handleCheckPermission = useCallback(async () => {
    if (user && users[user.uid].role === "admin") {
      await handleGetUsers();
    }
  }, [handleGetUsers, user, users]);

  useEffect(() => {
    handleCheckPermission();
  }, [users, handleCheckPermission]);

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
          <ButtonDropdownSort
            options={MODERATION_USER_SORT}
            stateSortBy={stateSort}
            stateSortDescending={stateSortDescending}
          />
        </div>
      </div>
    ),
    [stateQuery, stateSort, stateSortDescending, stateUserType, type]
  );

  const renderUserTable = useMemo(
    () => (
      <div className="h-full overflow-hidden">
        <div className="ManageUserTableTop pr-2">
          <Table className="!h-fit !border-b-0 !m-0">
            <Table.Header className="text-12px">
              <Table.Row>
                <Table.HeaderCell width="4">ID</Table.HeaderCell>
                <Table.HeaderCell width="3">Name</Table.HeaderCell>
                <Table.HeaderCell width="2">E-mail</Table.HeaderCell>
                <Table.HeaderCell width="3">Date Joined</Table.HeaderCell>
                <Table.HeaderCell width="2">Status</Table.HeaderCell>
                <Table.HeaderCell width="2">Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
          </Table>
        </div>
        <div
          className={clsx(
            "ManageUserTableBottom !border-l overflow-y-scroll",
            filteredData.length === 0 && "!h-full flex items-center"
          )}
        >
          {filteredData.length > 0 ? (
            <Table className=" !h-fit !border-b-0 !border-l-0">
              <Table.Body className="text-12px">
                {filteredData.map(
                  (
                    { id, name, joinDate, email, ban = false, role = "user" },
                    idx
                  ) => (
                    <Table.Row key={`${name}${idx}`}>
                      <Table.Cell width="4">{id}</Table.Cell>
                      <Table.Cell
                        width="3"
                        className={clsx(
                          role === "admin" && "font-bold text-blue-600"
                        )}
                      >
                        {role === "admin" && <Icon name="shield" />}
                        {name}
                      </Table.Cell>
                      <Table.Cell width="2">{email}</Table.Cell>
                      <Table.Cell width="3">
                        {strDateTime(new Date(joinDate ?? 0))}
                      </Table.Cell>
                      <Table.Cell
                        className={clsx(
                          "font-bold",
                          ban ? "text-red-500" : "text-green-500"
                        )}
                        width="2"
                      >
                        {ban ? "Banned" : "Active"}
                      </Table.Cell>
                      <Table.Cell width="2">
                        {ban ? (
                          <Button
                            size="mini"
                            color="yellow"
                            onClick={() => id && handleToggleBanUser(id, ban)}
                          >
                            Unban
                          </Button>
                        ) : (
                          <Button
                            size="mini"
                            color="red"
                            className={clsx(role === "admin" && "invisible")}
                            onClick={() =>
                              role !== "admin" &&
                              id &&
                              handleToggleBanUser(id, ban)
                            }
                          >
                            Ban
                          </Button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )
                )}
              </Table.Body>
            </Table>
          ) : (
            <LayoutNotice
              title="No Users"
              description="No users matched such query."
              illustration="/no-users.png"
            />
          )}
        </div>
      </div>
    ),
    [filteredData, handleToggleBanUser]
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

  return <>{loading && renderPage}</>;
}
