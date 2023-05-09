import { UserProfile } from "@/components";
import { ScreenSizeCategoryType, UserType } from "@/types";
import { Button } from "semantic-ui-react";

interface PageProfileDetailProps {
  profile: UserType;
  type: ScreenSizeCategoryType;
  onClickEdit: () => void;
  onClickChangePassword: () => void;
}

export function PageProfileDetailTab({
  profile,
  type,
  onClickEdit,
  onClickChangePassword,
}: PageProfileDetailProps) {
  return (
    <>
      {type !== "mobile" ? (
        <div className="flex flex-col">
          <h1>{profile.name}</h1>
          <h6>{profile.email}</h6>
        </div>
      ) : (
        <UserProfile profile={profile} className="!mb-4" />
      )}
      <div className="flex gap-4">
        <Button onClick={onClickEdit}>Edit Profile</Button>
        <Button onClick={onClickChangePassword}>Change Password</Button>
      </div>
    </>
  );
}
