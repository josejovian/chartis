import { User, UserProfile } from "@/components";
import {
  ScreenSizeCategoryType,
  UserProfileViewNameType,
  UserType,
} from "@/types";
import { useMemo } from "react";
import { Button } from "semantic-ui-react";

interface PageProfileDetailProps {
  profile: UserType;
  type: ScreenSizeCategoryType;
  viewType: UserProfileViewNameType;
  onClickEdit: () => void;
  onClickChangePassword: () => void;
  onBanUser?: () => void;
  loadingBan?: boolean;
}

export function PageProfileDetailTab({
  profile,
  type,
  viewType = "default",
  onClickEdit,
  onClickChangePassword,
  onBanUser,
  loadingBan,
}: PageProfileDetailProps) {
  const renderActions = useMemo(() => {
    switch (viewType) {
      case "self":
        return (
          <>
            <Button onClick={onClickEdit}>Edit Profile</Button>
            <Button onClick={onClickChangePassword}>Change Password</Button>
          </>
        );
      case "admin":
        return (
          <>
            <Button
              onClick={onBanUser}
              color={profile.ban ? "yellow" : "red"}
              loading={loadingBan}
            >
              {profile.ban ? "Unban User" : "Ban User"}
            </Button>
          </>
        );
    }
  }, [
    loadingBan,
    onBanUser,
    onClickChangePassword,
    onClickEdit,
    profile.ban,
    viewType,
  ]);

  return (
    <>
      {type !== "mobile" ? (
        <div className="flex flex-col">
          <h1>
            <User defaultUser={profile} type="name" showRole />
          </h1>
          <h6>{profile.email}</h6>
        </div>
      ) : (
        <UserProfile profile={profile} className="!mb-4" />
      )}
      <div className="flex gap-4">{renderActions}</div>
    </>
  );
}
