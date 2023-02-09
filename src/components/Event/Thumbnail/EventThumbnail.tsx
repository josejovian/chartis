import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { EventThumbnailDisplayType } from "@/types";

export interface EventThumbnailProps {
	alwaysVisible?: boolean;
	className?: string;
	height?: number;
	src?: string;
	width?: number;
	type?: EventThumbnailDisplayType;
}

export function EventThumbnail({
	className,
	src,
	type = "thumbnail-fixed-width",
}: EventThumbnailProps) {
	const [loaded, setLoaded] = useState(false);
	const [error, setError] = useState(false);
	const showImage = useMemo(
		() => (error && type === "banner") || loaded,
		[error, loaded, type]
	);
	const style = useMemo(() => {
		switch (type) {
			case "banner":
				return {
					width: "100%",
					height: "240px",
				};
			case "thumbnail-fixed-height":
				return {
					minWidth: "210px",
					height: "100%",
				};
			default:
				return undefined;
		}
	}, [type]);

	const renderImage = useMemo(
		() =>
			!loaded ? (
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
					src="/dummy.jpg"
					fill
					alt="Event Title"
					onError={() => {
						setError(true);
					}}
				/>
			),
		[loaded]
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
