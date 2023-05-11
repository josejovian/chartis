import { readData } from "@/firebase";
import { UserType } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserPicture } from "./UserPicture";
import { useIdentification } from "@/hooks";
import Link from "next/link";

export interface UserProps {
  id?: string;
  type: "all" | "picture" | "name";
}

export function User({ id, type }: UserProps) {
  const [user, setUser] = useState<UserType>();

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
        <Link href={user ? `/profile/${user.id}` : "#"}>
          {user ? user.name : "Unknown User"}
        </Link>
      );
  }, [loading, user]);

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
