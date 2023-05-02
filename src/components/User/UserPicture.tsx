import { getNameInitials } from "@/utils";
import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";

export interface UserPictureProps {
  fullName: string;
  pictureUrl?: string;
  size?: "small" | "big";
}

export function UserPicture({
  fullName,
  pictureUrl,
  size = "small",
}: UserPictureProps) {
  const initials = useMemo(
    () => getNameInitials(fullName).slice(0, 2),
    [fullName]
  );

  return (
    <div
      style={
        size === "small"
          ? {
              width: "2rem",
              height: "2rem",
              minWidth: "2rem",
              minHeight: "2rem",
            }
          : {
              width: "8rem",
              height: "8rem",
              minWidth: "8rem",
              minHeight: "8rem",
              fontSize: "4rem",
            }
      }
      className={clsx(
        "flex items-center justify-center",
        "rounded-full text-white bg-red-700 overflow-hidden z-10"
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
