import { readData } from "@/utils";
import { UserType } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserPicture } from "./UserPicture";
import { useIdentification } from "@/hooks";
import Link from "next/link";
import clsx from "clsx";
import { Icon } from "semantic-ui-react";

export interface UserProps {
  className?: string;
  id?: string;
  defaultUser?: UserType;
  type: "all" | "picture" | "name";
  truncate?: boolean;
  showRole?: boolean;
  dark?: boolean;
}

export function User({
  className,
  id,
  type,
  truncate,
  showRole,
  defaultUser,
  dark,
}: UserProps) {
  const [user, setUser] = useState<UserType | undefined>();

  const newUser = useMemo<UserType>(
    () =>
      user ??
      defaultUser ?? {
        id: "?",
        joinDate: 0,
        name: "Unknown User",
      },
    [defaultUser, user]
  );

  const { name, role, ban } = newUser;

  const displayedName = useMemo(
    () =>
      name
        ? !truncate || name.length < 12
          ? name
          : `${name.slice(0, 12)}...`
        : "Unknown User",
    [name, truncate]
  );

  const [loading, setLoading] = useState(true);

  const { stateIdentification } = useIdentification();
  const [identification, setIdentification] = stateIdentification;
  const { initialized, users } = identification;

  const handleFetchUserData = useCallback(async () => {
    if (!initialized) return;

    if (defaultUser) {
      setLoading(false);
      return;
    }

    const existing = id ? users[id] : null;

    if (existing) {
      setUser(existing);
    } else if (id) {
      await readData("users", id).then((result) => {
        if (result) {
          const newUser = {
            id,
            name: result.name,
            joinDate: result.joinDate,
            ban: result.ban,
            email: result.email,
          };
          setIdentification((prev) => ({
            ...prev,
            users: {
              ...prev.users,
              [id]: newUser,
            },
          }));
          setUser(newUser);
        }
      });
    }

    setLoading(false);
  }, [defaultUser, id, initialized, setIdentification, users]);

  useEffect(() => {
    handleFetchUserData();
  }, [handleFetchUserData]);

  const renderPicture = useMemo(
    () => <UserPicture fullName={name} loading={loading} />,
    [loading, name]
  );

  const renderName = useMemo(() => {
    if (loading)
      return <span className="skeleton !w-24 h-4 !rounded-sm"></span>;
    else
      return (
        <Link
          className={clsx(
            "User",
            dark
              ? "text-secondary-1 hover:text-secondary-2"
              : "text-secondary-5 hover:text-secondary-6",
            showRole &&
              newUser &&
              type === "name" && [
                role === "admin" && "font-bold !text-blue-600",
                ban && "font-bold !text-red-600",
              ],
            className
          )}
          href={newUser ? `/profile/${newUser.id}` : "#"}
        >
          {role === "admin" && showRole && <Icon name="shield" />}
          {displayedName}
        </Link>
      );
  }, [
    ban,
    className,
    dark,
    displayedName,
    loading,
    newUser,
    role,
    showRole,
    type,
  ]);

  const renderUser = useMemo(() => {
    switch (type) {
      case "all":
        return (
          <div className="flex items-center gap-4">
            {renderPicture}
            {renderName}
          </div>
        );
      case "picture":
        return renderPicture;
      case "name":
        return renderName;
    }
  }, [renderName, renderPicture, type]);

  return renderUser;
}
