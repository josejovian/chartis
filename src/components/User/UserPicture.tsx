import { getNameInitials } from "@/utils";
import clsx from "clsx";
import Image from "next/image";
import { CSSProperties, useMemo } from "react";

interface UserPictureProps {
  className?: string;
  fullName: string;
  pictureUrl?: string;
  size?: "small" | "medium" | "big";
  loading?: boolean;
}

export function UserPicture({
  className,
  fullName,
  pictureUrl,
  size = "small",
  loading,
}: UserPictureProps) {
  const initials = useMemo(
    () => (loading ? "" : getNameInitials(fullName).slice(0, 2)),
    [fullName, loading]
  );

  const sizeStyle = useMemo<CSSProperties>(() => {
    let sizeValue: [number, number] = [2, 1];
    switch (size) {
      case "big":
        sizeValue = [8, 4];
        break;
      case "medium":
        sizeValue = [3, 1.5];
        break;
      case "small":
        sizeValue = [2, 1];
        break;
    }

    const pictureSize = `${sizeValue[0]}rem`;
    const textSize = `${sizeValue[1]}rem`;

    return {
      width: pictureSize,
      height: pictureSize,
      minWidth: pictureSize,
      minHeight: pictureSize,
      fontSize: textSize,
      borderRadius: "100%!important",
    };
  }, [size]);

  return (
    <div
      style={{
        ...sizeStyle,
      }}
      className={clsx(
        "flex items-center justify-center",
        "!rounded-full text-white overflow-hidden z-10",
        loading ? "skeleton" : "bg-red-700",
        className
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
