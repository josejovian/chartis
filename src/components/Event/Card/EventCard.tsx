import { useCallback, useMemo, useState } from "react";
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
import { setDataToPath } from "@/firebase";
import { useRouter } from "next/router";

export interface EventCardProps {
  className?: string;
  identification: IdentificationType;
  event: EventType;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
  type?: EventCardDisplayType;
}

export function EventCard({
  className,
  identification,
  event,
  updateEvent,
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
  const { users } = identification;

  const stateDeleting = useState(false);
  const setDeleting = stateDeleting[1];
  const router = useRouter();

  const truncatedDescription = useMemo(
    () =>
      description.length < 100
        ? description
        : `${description.slice(0, 100)}...`,
    [description]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!event.id) return;

    setDeleting(true);

    await setDataToPath(`/events/${event.id}/`, {})
      .then(async () => {
        router.push(`/`);
      })
      .catch((e) => {
        setDeleting(false);
      });
  }, [event, router, setDeleting]);

  const startDate = useMemo(() => new Date(event.startDate), [event]);
  const endDate = useMemo(
    () => (event.endDate ? new Date(event.endDate) : null),
    [event]
  );
  const eventLink = useMemo(() => `/event/${id}`, [id]);

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
        value: strDateTime(endDate),
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
                key={`EventExtraDetail_${id}_${detail.id}`}
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
      <span className="text-12px text-secondary-4 tracking-wide">
        Posted by{" "}
        <span className="text-secondary-6 font-black">
          {users[authorId] ? users[authorId].name : authorId}
        </span>{" "}
        {getTimeDifference(postDate)}
        {organizer && (
          <>
            &nbsp;- Organized by&nbsp;
            <span className="text-secondary-6 font-black">{organizer}</span>
          </>
        )}
      </span>
    ),
    [authorId, organizer, postDate, users]
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
      <Link className="mt-1" href={eventLink}>
        <p className="m-0 mb-2">{truncatedDescription}</p>
      </Link>
    ),
    [eventLink, truncatedDescription]
  );

  const renderEventActions = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-auto gap-4  w-48 !relative",
          type === "vertical" && "mt-2",
          type === "horizontal" && "justify-end"
        )}
        style={{
          maxWidth: "192px",
        }}
      >
        <EventButtonFollow
          event={event}
          updateEvent={updateEvent}
          identification={identification}
          size="tiny"
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size="tiny"
          onDelete={handleDeleteEvent}
        />
      </div>
    ),
    [event, identification, type, updateEvent, handleDeleteEvent]
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
            <div className="flex justify-between place-items-end !w-full">
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
        width: "100%",
        height: undefined,
      }}
    >
      {renderCardContents}
    </div>
  );
}
