import {
  ReactNode,
  RefObject,
  UIEventHandler,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import clsx from "clsx";
import { EventThumbnailDisplayType, ScreenSizeCategoryType } from "@/types";

export interface EventThumbnailProps {
  imageRef?: RefObject<HTMLImageElement>;
  className?: string;
  src?: string;
  screenType?: ScreenSizeCategoryType;
  type?: EventThumbnailDisplayType;
  size?: [number, number];
  footer?: ReactNode;
  onWheel?: UIEventHandler<HTMLDivElement>;
}

export function EventThumbnail({
  imageRef,
  className,
  src,
  screenType,
  type = "thumbnail-fixed-width",
  size,
  footer,
  onWheel,
}: EventThumbnailProps) {
  const placeholderURL = "/placeholder.png";
  const [imageURL, setImageURL] = useState(
    src && src.length > 0 ? src : placeholderURL
  );
  const style = useMemo(() => {
    switch (type) {
      case "banner":
        return {
          width: "100%",
          height: "100%",
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
    setImageURL(src && src.length > 0 ? src : placeholderURL);
  }, [src]);

  const renderImage = useMemo(
    () => (
      <Image
        priority
        className="EventThumbnail object-cover"
        placeholder="empty"
        src={imageURL ?? placeholderURL}
        fill={!size}
        alt="Event Thumbnail"
        onError={() => {
          setImageURL(placeholderURL);
        }}
        width={size ? size[0] : undefined}
        height={size ? size[1] : undefined}
      />
    ),
    [imageURL, size]
  );

  return src || type === "banner" ? (
    <div
      ref={imageRef}
      className={clsx(
        "relative flex items-center justify-center overflow-hidden bg-gray-700",
        type !== "banner" && "aspect-video",
        className
      )}
      style={style}
      onWheel={onWheel}
    >
      {renderImage}
      {footer}
    </div>
  ) : (
    <></>
  );
}
