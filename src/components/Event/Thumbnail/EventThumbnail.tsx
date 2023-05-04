import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { EventThumbnailDisplayType, ScreenSizeCategoryType } from "@/types";

export interface EventThumbnailProps {
  className?: string;
  src?: string;
  screenType?: ScreenSizeCategoryType;
  type?: EventThumbnailDisplayType;
}

export function EventThumbnail({
  className,
  src,
  screenType,
  type = "thumbnail-fixed-width",
}: EventThumbnailProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const showImage = useMemo(
    () => (error && type === "banner") || (loaded && src),
    [error, loaded, src, type]
  );
  const style = useMemo(() => {
    switch (type) {
      case "banner":
        return {
          width: "100%",
          height: screenType !== "mobile" ? "240px" : "320px",
        };
      case "thumbnail-fixed-height":
        return {
          minWidth: "210px",
          height: "100%",
        };
      default:
        return undefined;
    }
  }, [screenType, type]);

  const renderImage = useMemo(
    () =>
      !loaded || !src ? (
        <Image
          className="object-cover"
          placeholder="empty"
          src="/placeholder.png"
          fill
          alt="Event Picture Placeholder"
        />
      ) : (
        <Image
          className="object-cover"
          placeholder="empty"
          src={src}
          fill
          alt="Event Title"
          onError={() => {
            setError(true);
          }}
        />
      ),
    [loaded, src]
  );

  useEffect(() => {
    setLoaded(true);
  }, []);

  return showImage ? (
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
