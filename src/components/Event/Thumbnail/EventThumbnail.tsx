import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { EventThumbnailDisplayType } from "@/types";

export interface EventThumbnailProps {
  className?: string;
  src?: string;
  type?: EventThumbnailDisplayType;
}

export function EventThumbnail({
  className,
  src,
  type = "thumbnail-fixed-width",
}: EventThumbnailProps) {
  const placeholderURL = "/placeholder.png";
  const [imageURL, setImageURL] = useState(src ?? placeholderURL);
  const style = useMemo(() => {
    switch (type) {
      case "banner":
        return {
          width: "100%",
          height: "240px",
          display: "flex",
        };
      case "thumbnail-fixed-height":
        return {
          minWidth: "210px",
          height: "100%",
          display: "flex",
        };
      default:
        return undefined;
    }
  }, [type]);

  useEffect(() => {
    setImageURL(src ?? placeholderURL);
  }, [src]);

  const renderImage = useMemo(
    () => (
      <Image
        className="object-cover"
        placeholder="empty"
        src={imageURL}
        fill
        alt="Event Picture Placeholder"
        onError={() => {
          setImageURL(placeholderURL);
        }}
      />
    ),
    [imageURL]
  );

  return src || type === "banner" ? (
    <div
      className={clsx(
        "relative flex items-center overflow-hidden",
        type !== "banner" && "aspect-video",
        className
      )}
      style={style}
    >
      {renderImage}
    </div>
  ) : (
    <></>
  );
}
