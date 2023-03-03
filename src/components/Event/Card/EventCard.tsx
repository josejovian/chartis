import { useMemo } from "react";
import Link from "next/link";
import { Card } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventCardDetail,
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
  EventTags,
} from "@/components";
import { getTimeDifference, strDateTime } from "@/utils";
import {
  EventCardDisplayType,
  EventDetailCompactType,
  EventType,
  IdentificationType,
} from "@/types";

export interface EventCardProps {
  className?: string;
  identification: IdentificationType;
  event: EventType;
  type?: EventCardDisplayType;
}

export function EventCard({
  className,
  identification,
  event,
  type = "vertical",
}: EventCardProps) {
  const {
    id,
    name,
    description,
    authorId,
    organizer,
    thumbnailSrc,
    tags,
    postDate,
  } = event;

  const startDate = useMemo(() => new Date(event.startDate), [event]);
  const endDate = useMemo(
    () => (event.endDate ? new Date(event.endDate) : null),
    [event]
  );
  const eventLink = useMemo(() => "/event/ok", []);

  const details = useMemo(() => {
    const array: EventDetailCompactType[] = [
      {
        id: "startDate",
        icon: "calendar",
        name: "Start Date",
        value: strDateTime(startDate),
      },
    ];

    if (endDate)
      array.push({
        id: "endDate",
        icon: "calendar",
        name: "End Date",
        value: endDate.toLocaleString(),
      });

    return array;
  }, [endDate, startDate]);

  const renderEventExtraDetails = useMemo(
    () => (
      <ul className="flex flex-col text-secondary-5 gap-1 mt-1">
        {details.map(
          (detail, idx) =>
            ((type === "horizontal" && idx === 0) || type === "vertical") && (
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
        Posted by <b>{authorId}</b> {getTimeDifference(postDate)} ago
        {organizer &&
          `- Organized by
				<b>${organizer}</b>`}
      </span>
    ),
    [authorId, organizer, postDate]
  );

  const renderEventTags = useMemo(
    () => <EventTags id={id} tags={tags} />,
    [id, tags]
  );

  const renderEventTitle = useMemo(
    () => (
      <div className="inline-block leading-7">
        <Link href={eventLink}>
          <h2 className="inline text-18px pr-1 hover:underline">{name}</h2>
        </Link>
        {renderEventTags}
      </div>
    ),
    [eventLink, name, renderEventTags]
  );

  const renderEventDescription = useMemo(
    () => (
      <Link href={eventLink}>
        <p className="m-0 mt-1 mb-2">{description}</p>
      </Link>
    ),
    [description, eventLink]
  );

  const renderEventActions = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-auto gap-4 z-10",
          type === "vertical" && "mt-2"
        )}
        style={{
          width: "192px",
          minWidth: "192px",
        }}
      >
        <EventButtonFollow
          event={event}
          identification={identification}
          size="tiny"
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size="tiny"
        />
      </div>
    ),
    [event, identification, type]
  );

  const renderCardContents = useMemo(
    () =>
      type === "vertical" ? (
        <Card className="EventCard" fluid>
          <EventThumbnail src={thumbnailSrc} />
          <div className="flex flex-col py-2 pb-3 px-10 w-full">
            {renderEventCreators}
            <div className="EventDetail flex flex-col">
              {renderEventTitle}
              {renderEventDescription}
            </div>
            {renderEventExtraDetails}
            {renderEventActions}
          </div>
        </Card>
      ) : (
        <Card fluid className="EventCard flex !flex-row h-full">
          <EventThumbnail src={thumbnailSrc} type="thumbnail-fixed-height" />
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
      type,
      thumbnailSrc,
      renderEventCreators,
      renderEventTitle,
      renderEventDescription,
      renderEventExtraDetails,
      renderEventActions,
    ]
  );

  return (
    <div
      className={className}
      style={{
        width: type === "horizontal" ? "75%" : "100%",
        height: type === "horizontal" ? "120px" : undefined,
      }}
    >
      {renderCardContents}
    </div>
  );
}
