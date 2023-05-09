import { UserType } from "@/types";
import { UserPicture } from "./UserPicture";
import clsx from "clsx";

interface UserPictureProps {
  className?: string;
  profile: UserType;
}

export function UserProfile({ profile, className }: UserPictureProps) {
  return (
    <div className={clsx("flex gap-4 mb-8", className)}>
      <UserPicture fullName={profile.name ?? ""} size="medium" />
      <div className="flex flex-col justify-center">
        <h1 className="text-20px">{profile.name}</h1>
        <h6>{profile.email}</h6>
      </div>
    </div>
  );
}
