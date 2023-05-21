import { UserType } from "@/types";
import { UserPicture } from "./UserPicture";
import clsx from "clsx";
import { User } from "./User";
import { Icon } from "semantic-ui-react";
import { strDate } from "@/utils";

interface UserPictureProps {
  className?: string;
  profile: UserType;
}

export function UserProfile({ profile, className }: UserPictureProps) {
  return (
    <div className={clsx("flex gap-4 mb-8", className)}>
      <UserPicture fullName={profile.name ?? ""} size="medium" />
      <div className="flex flex-col justify-center">
        <h1 className="text-20px">
          <User defaultUser={profile} type="name" showRole />
        </h1>
        <div className="flex flex-col mt-1 gap-2 text-sm text-secondary-6">
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
    </div>
  );
}
