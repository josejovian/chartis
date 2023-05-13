import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card, Icon, Popup } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventCardDetail,
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
  EventTags,
  User,
} from "@/components";
import { strDateTime } from "@/utils";
import {
  EventCardDisplayType,
  EventDetailCompactType,
  EventType,
} from "@/types";
import { useEvent, useIdentification, useReport } from "@/hooks";

export interface EventCardProps {
  className?: string;
  event: EventType;
  type?: EventCardDisplayType;
  updateUserSubscribedEventClientSide: (
    userId: string,
    eventId: string,
    version?: number
  ) => void;
  extraDeleteHandler?: (eventId: string) => void;
}

export function EventCard({
  className,
  event,
  type = "vertical",
  updateUserSubscribedEventClientSide,
  extraDeleteHandler,
}: EventCardProps) {
  const [wasDeleted, setWasDeleted] = useState(false);
  const { id, name, description, authorId, thumbnailSrc, tags, hide } = event;
  const { stateIdentification } = useIdentification();
  const identification = stateIdentification[0];
  const { user } = identification;
  const { deleteEvent } = useEvent();
  const { showReportModal } = useReport();
  const stateDeleting = useState(false);
  const setDeleting = stateDeleting[1];
  const stateModalDelete = useState(false);
  const setModalDelete = stateModalDelete[1];
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
    deleteEvent(id)
      .then(() => {
        extraDeleteHandler && extraDeleteHandler(id);
        setWasDeleted(true);
      })
      .catch(() => {
        setDeleting(false);
      })
      .finally(() => {
        setModalDelete(false);
      });
  }, [
    deleteEvent,
    event.id,
    extraDeleteHandler,
    id,
    setDeleting,
    setModalDelete,
  ]);

  const handleEditEvent = useCallback(() => {
    if (!event.id) return;

    router.push(
      {
        pathname: `/event/${event.id}/`,
        query: { mode: "edit" },
      },
      `/event/${event.id}/`
    );
  }, [event, router]);

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
        <User id={authorId} type="name" />
        <User id={authorId} type="name" />
      </span>
    ),
    [authorId]
  );

  const renderEventTags = useMemo(
    () => <EventTags id={id} tags={tags} />,
    [id, tags]
  );

  const renderEventTitle = useMemo(
    () => (
      <div className="inline-block leading-7">
        {hide && (
          <Popup
            trigger={<Icon name="eye slash" className="text-secondary-5" />}
            content="Hidden"
            size="tiny"
            offset={[-25, 0]}
            basic
            inverted
          />
        )}
        <Link href={eventLink}>
          <h2
            className={clsx(
              "inline text-18px pr-1 hover:underline",
              hide && "text-secondary-5"
            )}
          >
            {name}
          </h2>
        </Link>
        {renderEventTags}
      </div>
    ),
    [eventLink, hide, name, renderEventTags]
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
          identification={identification}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
          size="tiny"
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size="tiny"
          stateModalDelete={stateModalDelete}
          onDelete={handleDeleteEvent}
          onEdit={handleEditEvent}
          onReport={() =>
            showReportModal({
              eventId: id,
              contentType: "event",
              authorId,
              reportedBy: user ? user.id : "invalid",
            })
          }
        />
      </div>
    ),
    [
      type,
      event,
      identification,
      updateUserSubscribedEventClientSide,
      stateModalDelete,
      handleDeleteEvent,
      handleEditEvent,
      showReportModal,
      id,
      authorId,
      user,
    ]
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

  return wasDeleted ? (
    <></>
  ) : (
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
