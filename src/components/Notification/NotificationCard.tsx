import { useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Card } from "semantic-ui-react";
import { User } from "@/components";
import { useScreen } from "@/hooks";
import { getTimeDifference } from "@/utils";
import { EVENT_UPDATE_TERM } from "@/consts";
import {
  UpdateNameType,
  UpdateChangedValueType,
  NotificationData,
} from "@/types";

interface NotificationCardProps {
  updateData: NotificationData;
  handleReadNotification: (
    eventId: string,
    eventVersion: number
  ) => Promise<void>;
}

export function NotificationCard({
  updateData,
  handleReadNotification,
}: NotificationCardProps) {
  const { eventId, eventVersion, eventName, authorId, lastUpdatedAt, changes } =
    updateData;
  const { type } = useScreen();

  const renderAuthorPicture = useMemo(
    () => <User id={authorId} type="picture" />,
    [authorId]
  );
  const renderAuthor = useMemo(
    () => <User id={authorId} type="name" />,
    [authorId]
  );

  const renderChangeList = useMemo(
    () => (
      <ul className={NOTIFICATION_CHANGES_LIST_STYLE}>
        {(
          Object.entries(changes) as [UpdateNameType, UpdateChangedValueType][]
        ).map(([UpdateChangesType, { valuePrevious, valueNew }], idx) => (
          <li
            className={clsx(idx > 0 && "mt-2", "pr-8")}
            key={`Update_${eventId}_${idx}`}
          >
            {UpdateChangesType !== "update-description" ? (
              <>
                <b>Update {EVENT_UPDATE_TERM[UpdateChangesType]}:</b>{" "}
                <span className="text-gray-400 line-through text-16px">
                  {valuePrevious}
                </span>{" "}
                ➔ {valueNew}
              </>
            ) : (
              <b>Update description.</b>
            )}
          </li>
        ))}
      </ul>
    ),
    [changes, eventId]
  );

  const renderUpdateCard = useMemo(
    () => (
      <div className="break-words w-full pr-8">
        <Link href={`/event/${eventId}`}>
          <p className="text-16px mb-2 pr-8">
            <b>{renderAuthor}</b> updated <b>{eventName}</b>.
          </p>
          {renderChangeList}
          <span className="text-gray-400">
            {getTimeDifference(lastUpdatedAt)}
          </span>
        </Link>
      </div>
    ),
    [renderAuthor, eventId, eventName, lastUpdatedAt, renderChangeList]
  );

  return (
    <Card
      className={clsx(
        NOTIFICATION_CARD_BASE_STYLE,
        type !== "mobile"
          ? NOTIFICATION_CARD_DESKTOP_STYLE
          : NOTIFICATION_CARD_MOBILE_STYLE
      )}
      fluid
    >
      <div>{renderAuthorPicture}</div>
      <div
        className={clsx(
          NOTIFICATION_MAIN_BASE_STYLE,
          type !== "mobile"
            ? NOTIFICATION_MAIN_DESKTOP_STYLE
            : NOTIFICATION_MAIN_MOBILE_STYLE
        )}
      >
        {renderUpdateCard}
        <Button
          className={clsx("!w-fit", type !== "mobile" ? "self-end" : "!mt-4")}
          onClick={() => handleReadNotification(eventId, eventVersion)}
        >
          Read
        </Button>
      </div>
    </Card>
  );
}

const NOTIFICATION_CARD_BASE_STYLE =
  "NotificationCard w-full !min-h-fit !break-words !flex-row !py-5";

const NOTIFICATION_CARD_DESKTOP_STYLE = "!px-10";

const NOTIFICATION_CARD_MOBILE_STYLE = "!px-5";

const NOTIFICATION_MAIN_BASE_STYLE = "flex pt-1 w-full";

const NOTIFICATION_MAIN_DESKTOP_STYLE = "flex-row pl-10";

const NOTIFICATION_MAIN_MOBILE_STYLE = "flex-col pl-5";

const NOTIFICATION_CHANGES_LIST_STYLE = "pb-2 w-full pl-8";
