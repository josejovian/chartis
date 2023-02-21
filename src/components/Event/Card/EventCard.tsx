import clsx from "clsx";
import { useMemo } from "react";
import { Card } from "semantic-ui-react";
import {
  EventTag,
  EventCardDetail,
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
} from "@/components";
import { strDateTime } from "@/utils";
import { EVENT_TAGS } from "@/consts";
import { EventCardDisplayType, EventDetailType, EventType } from "@/types";
import Link from "next/link";

export interface EventCardProps {
  className?: string;
  event: EventType;
  type?: EventCardDisplayType;
}

export function EventCard({
  className,
  event,
  type = "vertical",
}: EventCardProps) {
  const { id, name, description, authorId, organizer, src, tags } = event;

  const startDate = useMemo(() => new Date(event.startDate), [event]);
  const endDate = useMemo(
    () => (event.endDate ? new Date(event.endDate) : null),
    [event]
  );
  const eventLink = useMemo(() => "/event/ok", []);

  const details = useMemo(() => {
    const array: EventDetailType[] = [
      {
        icon: "calendar",
        name: "Start Date",
        value: strDateTime(startDate),
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
        <EventButtonFollow event={event} size="tiny" />
        <EventButtonMore size="tiny" />
      </div>
    ),
    [event, type]
  );

  const renderCardContents = useMemo(
    () =>
      type === "vertical" ? (
        <Card className="EventCard" fluid>
          <EventThumbnail src={src} />
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
      type,
      src,
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
