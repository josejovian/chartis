import { getNameInitials } from "@/utils";
import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";

export interface UserPictureProps {
  fullName: string;
  pictureUrl?: string;
}

export function UserPicture({ fullName, pictureUrl }: UserPictureProps) {
  const initials = useMemo(
    () => getNameInitials(fullName).slice(0, 2),
    [fullName]
  );

  return (
    <div
      className={clsx(
        "flex items-center justify-center w-8 h-8",
        "rounded-full bg-red-700 overflow-hidden z-10"
      )}
    >
      {pictureUrl ? (
        <Image
          src={pictureUrl}
          width="32"
          height="32"
          alt="Your User Profile Picture"
        />
      ) : (
        initials
      )}
    </div>
  );
}
