import { readData } from "@/firebase";
import { UserType } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserPicture } from "./UserPicture";
import { useIdentification } from "@/hooks";

export interface UserProps {
  id: string;
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

    const existing = users[id];

    if (existing) {
      setUser(existing);
    } else {
      await readData("users", id).then((result) => {
        if (result)
          setIdentification((prev) => ({
            ...prev,
            users: {
              ...prev.users,
              [id]: result,
            },
          }));
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
    if (loading) return <span className="skeleton w-24 h-4 !rounded-sm"></span>;
    else return <span>{user ? user.name : "Unknown User"}</span>;
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
