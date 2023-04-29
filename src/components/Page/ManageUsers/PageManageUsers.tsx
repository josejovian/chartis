import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  LayoutCard,
  TemplateSearchInput,
  ButtonDropdownSelect,
  ButtonDropdownSort,
} from "@/components";
import { useIdentification, useScreen } from "@/hooks";
import { Button, Icon, Table } from "semantic-ui-react";
import { DropdownSortOptionType, UserGroupFilterType, UserType } from "@/types";
import { collection, getDocs } from "firebase/firestore";
import { fs } from "@/firebase";
import { strDateTime } from "@/utils";
import {
  MODERATION_USER_SORT,
  MODERATION_USER_TYPE_FILTERS,
} from "@/consts/moderation";

export interface PageManageUsersProps {
  className?: string;
}

export function PageManageUsers({ className }: PageManageUsersProps) {
  const { stateIdentification } = useIdentification();
  const [{ user, users }] = stateIdentification;
  const [loading] = useState(true);
  const { type } = useScreen();

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
  const [data, setData] = useState<UserType[]>([]);

  const filteredData = useMemo(
    () =>
      data
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

  const handleGetUsers = useCallback(async () => {
    if (data.length > 0) return;

    const docs = await getDocs(collection(fs, "users"));
    const results: UserType[] = [];

    docs.forEach((doc) => {
      const result = doc.data();

      if (result)
        results.push({
          id: doc.id,
          ...result,
        } as UserType);
    });

    setData(results);
  }, [data.length]);

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
          "flex gap-4 mb-4",
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
      <div className="!h-full overflow-hidden">
        <Table className="ManageUserTableTop !h-fit !border-b-0 !m-0 overflow-y-scroll">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width="6">ID</Table.HeaderCell>
              <Table.HeaderCell width="2">Name</Table.HeaderCell>
              <Table.HeaderCell width="2">E-mail</Table.HeaderCell>
              <Table.HeaderCell width="2">Date Joined</Table.HeaderCell>
              <Table.HeaderCell width="2">Status</Table.HeaderCell>
              <Table.HeaderCell width="2">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
        </Table>
        <div className="ManageUserTableBottom !h-full overflow-y-scroll">
          <Table className="!border !h-fit">
            <Table.Body className="text-12px">
              {[
                ...filteredData,
                ...filteredData,
                ...filteredData,
                ...filteredData,
              ].map(
                ({ id, name, joinDate, email, ban, role = "user" }, idx) => (
                  <Table.Row key={`${name}${idx}`}>
                    <Table.Cell width="6">{id}</Table.Cell>
                    <Table.Cell
                      width="2"
                      className={clsx(
                        role === "admin" && "font-bold text-blue-600"
                      )}
                    >
                      {role === "admin" && <Icon name="shield" />}
                      {name}
                    </Table.Cell>
                    <Table.Cell width="2">{email}</Table.Cell>
                    <Table.Cell width="2">
                      {strDateTime(new Date(joinDate ?? 0))}
                    </Table.Cell>
                    <Table.Cell width="2">
                      {ban ? "Banned" : "Active"}
                    </Table.Cell>
                    <Table.Cell width="2">
                      <Button
                        size="mini"
                        color="red"
                        disabled={ban || role === "admin"}
                      >
                        Ban
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                )
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    ),
    [filteredData]
  );

  const renderPage = useMemo(
    () => (
      <LayoutCard className={className}>
        {renderControls}
        {renderUserTable}
      </LayoutCard>
    ),
    [className, renderControls, renderUserTable]
  );

  return <>{loading && renderPage}</>;
}
