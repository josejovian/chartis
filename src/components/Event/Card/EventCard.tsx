import clsx from "clsx";
import { useMemo } from "react";
import { Button, Card, Icon, Label } from "semantic-ui-react";
import { EventTag, EventCardDetail, EventThumbnail } from "@/components";
import { EventCardDisplayType, EventExtraDetailType, EventType } from "@/types";
import { EVENT_TAGS } from "@/consts/event";

export interface EventCardProps {
	event: EventType;
	type?: EventCardDisplayType;
}

export function EventCard({ event, type = "vertical" }: EventCardProps) {
	const { id, authorId, description, name, organizer, tags, src } = event;

	const startDate = useMemo(() => new Date(event.startDate), [event]);
	const endDate = useMemo(
		() => (event.endDate ? new Date(event.endDate) : null),
		[event]
	);

	const details = useMemo(() => {
		const array: EventExtraDetailType[] = [
			{
				icon: "calendar",
				name: "Start Date",
				value: startDate.toLocaleString(),
			},
		];

		if (endDate)
			array.push({
				icon: "calendar",
				name: "End Date",
				value: endDate.toLocaleString(),
			});

		return array;
	}, [endDate, startDate]);

	const renderEventExtraDetails = useMemo(
		() => (
			<ul className="flex flex-col text-secondary-5 gap-1">
				{details.map(
					(detail, idx) =>
						((type === "horizontal" && idx === 0) ||
							type === "vertical") && (
							<EventCardDetail
								key={`EventExtraDetail_${id}_${detail.icon}`}
								{...detail}
							/>
						)
				)}
			</ul>
		),
		[details, id, type]
	);

	const renderEventCreators = useMemo(
		/** @todo Replace authorId with real username. */
		() => (
			<span className="text-12px text-secondary-4">
				Posted by <b>{authorId}</b> a week ago{" "}
				{organizer &&
					`- Organized by
				<b>${organizer}</b>`}
			</span>
		),
		[authorId, organizer]
	);

	const renderEventTags = useMemo(
		() => (
			<>
				{tags.map((tag) => (
					<EventTag
						key={`EventExtraDetail_${id}_${tag}`}
						{...EVENT_TAGS[tag]}
					/>
				))}
			</>
		),
		[id, tags]
	);

	const renderEventTitle = useMemo(
		() => (
			<div className="inline-block leading-7">
				<h2 className="inline text-18px pr-1">{name}</h2>
				{renderEventTags}
			</div>
		),
		[name, renderEventTags]
	);

	const renderEventDescription = useMemo(
		() => <p className="m-0 mt-1 mb-2">{description}</p>,
		[description]
	);

	const renderEventActions = useMemo(
		() => (
			<div className={clsx("flex gap-2", type === "vertical" && "mt-2")}>
				<Button as="div" labelPosition="right">
					<Button>
						<Icon name="calendar plus" />
						Follow
					</Button>
					<Label as="a" basic>
						4
					</Label>
				</Button>
				<Button icon>
					<Icon name="ellipsis vertical" />
				</Button>
			</div>
		),
		[type]
	);

	const renderCardContents = useMemo(
		() =>
			type === "vertical" ? (
				<Card fluid>
					<EventThumbnail src={src} />
					<div className="flex flex-col py-2 pb-3 px-10 w-full">
						{renderEventCreators}
						{renderEventTitle}
						{renderEventDescription}
						{renderEventExtraDetails}
						{renderEventActions}
					</div>
				</Card>
			) : (
				<Card fluid className="flex !flex-row h-full">
					<EventThumbnail src={src} type="thumbnail-fixed-height" />
					<div className="flex flex-col py-2 pb-3 px-10 w-full h-full justify-between">
						<div className="flex flex-col">
							{renderEventCreators}
							{renderEventTitle}
						</div>
						<div className="flex justify-between place-items-end">
							{renderEventExtraDetails}
							{renderEventActions}
						</div>
					</div>
				</Card>
			),
		[
			renderEventActions,
			renderEventCreators,
			renderEventDescription,
			renderEventExtraDetails,
			renderEventTitle,
			type,
			src,
		]
	);
	return (
		<div
			style={{
				width: type === "horizontal" ? "75%" : "100%",
				height: type === "horizontal" ? "120px" : undefined,
			}}
		>
			{renderCardContents}
		</div>
	);
}
