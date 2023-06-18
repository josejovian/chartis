import { User, UserProfile } from "@/components";
import {
  ScreenSizeCategoryType,
  UserProfileViewNameType,
  UserType,
} from "@/types";
import { strDate } from "@/utils";
import { useMemo } from "react";
import { Button, Icon } from "semantic-ui-react";

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
            <Button
              onClick={onClickEdit}
              size={type === "mobile" ? "tiny" : undefined}
            >
              Edit Profile
            </Button>
            <Button
              onClick={onClickChangePassword}
              size={type === "mobile" ? "tiny" : undefined}
            >
              Change Password
            </Button>
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
    type,
    viewType,
  ]);

  return (
    <>
      {type !== "mobile" ? (
        <div className="flex flex-col">
          <h1>
            <User defaultUser={profile} type="name" showRole />
          </h1>
          <div className="flex flex-row flex-wrap mt-1 gap-2 mb-2 text-secondary-6">
            <h6>
              <Icon name="envelope" />
              {profile.email}
            </h6>
            <h6>
              <Icon name="calendar" />
              Joined on {strDate(new Date(profile.joinDate ?? 0))}
            </h6>
          </div>
        </div>
      ) : (
        <UserProfile profile={profile} className="!mb-4" />
      )}
      <div className="flex flex-wrap gap-4">{renderActions}</div>
    </>
  );
}
