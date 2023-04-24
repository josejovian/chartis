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
        "flex items-center justify-center",
        "rounded-full text-white bg-red-700 overflow-hidden z-10"
      )}
      style={{
        width: "2rem",
        height: "2rem",
        minWidth: "2rem",
        minHeight: "2rem",
      }}
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
