import { getNameInitials } from "@/utils";
import clsx from "clsx";
import Image from "next/image";
import { useMemo } from "react";

export interface UserPictureProps {
  fullName: string;
  pictureUrl?: string;
  size?: "small" | "big";
  loading?: boolean;
}

export function UserPicture({
  fullName,
  pictureUrl,
  size = "small",
  loading,
}: UserPictureProps) {
  const initials = useMemo(
    () => (loading ? "" : getNameInitials(fullName).slice(0, 2)),
    [fullName, loading]
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
        "rounded-full text-white overflow-hidden z-10",
        loading ? "skeleton" : "bg-red-700"
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
