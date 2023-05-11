import { readData } from "@/firebase";
import { UserType } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserPicture } from "./UserPicture";
import { useIdentification } from "@/hooks";
import Link from "next/link";

export interface UserProps {
  className?: string;
  id?: string;
  type: "all" | "picture" | "name";
  truncate?: boolean;
}

export function User({ className, id, type }: UserProps) {
  const [user, setUser] = useState<UserType>();
  const displayedName = useMemo(
    () =>
      user
        ? user.name.length < 12
          ? user.name
          : `${user.name.slice(0, 12)}...`
        : "Unknown User",
    [user]
  );

  const [loading, setLoading] = useState(true);

  const { stateIdentification } = useIdentification();
  const [identification, setIdentification] = stateIdentification;
  const { initialized, users } = identification;

  const handleFetchUserData = useCallback(async () => {
    if (!initialized) return;

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
  }, [id, initialized, setIdentification, users]);

  useEffect(() => {
    handleFetchUserData();
  }, [handleFetchUserData]);

  const renderPicture = useMemo(
    () => <UserPicture fullName={user?.name ?? "?"} loading={loading} />,
    [loading, user?.name]
  );

  const renderName = useMemo(() => {
    if (loading)
      return <span className="skeleton !w-24 h-4 !rounded-sm"></span>;
    else
      return (
        <Link className={className} href={user ? `/profile/${user.id}` : "#"}>
          {displayedName}
        </Link>
      );
  }, [className, displayedName, loading, user]);

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
