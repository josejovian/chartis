import { useMemo } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Button, Card } from "semantic-ui-react";
import { UserPicture } from "@/components";
import { useScreen } from "@/hooks";
import { getTimeDifference } from "@/utils";
import { EVENT_UPDATE_TERM } from "@/consts";
import {
  EventUpdateBatchType,
  EventUpdateNameType,
  EventUpdateType,
} from "@/types";

interface NotificationCardProps {
  update: EventUpdateBatchType;
  handleReadNotification: () => void;
  handleReadAndViewNotification: () => void;
}

export function NotificationCard({
  update,
  handleReadNotification,
  handleReadAndViewNotification,
}: NotificationCardProps) {
  const { authorId, eventId, updates, date, updateId } = update;
  const { type } = useScreen();
  const renderChangeList = useMemo(
    () => (
      <ul className={NOTIFICATION_CHANGES_LIST_STYLE}>
        {(
          Object.entries(updates) as [EventUpdateNameType, EventUpdateType][]
        ).map(([updateType, { valuePrevious, valueNew }], idx) => (
          <li
            className={clsx(idx > 0 && "mt-2", "pr-8")}
            key={`Update_${updateId}_${idx}`}
          >
            {updateType !== "update-description" ? (
              <>
                <b>Update {EVENT_UPDATE_TERM[updateType]}:</b>{" "}
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
    [updateId, updates]
  );

  const renderUpdateDetail = useMemo(
    () => (
      <div className="break-words w-full pr-8">
        <Link href="#" onClick={() => handleReadAndViewNotification()}>
          <p className="text-16px mb-2 pr-8">
            <b>{authorId}</b> updated <b>{eventId}</b>.
          </p>
          {renderChangeList}
          <span className="text-gray-400">{getTimeDifference(date)}</span>
        </Link>
      </div>
    ),
    [authorId, date, eventId, handleReadAndViewNotification, renderChangeList]
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
      <div>
        <UserPicture fullName="Unknown User" />
      </div>
      <div
        className={clsx(
          NOTIFICATION_MAIN_BASE_STYLE,
          type !== "mobile"
            ? NOTIFICATION_MAIN_DESKTOP_STYLE
            : NOTIFICATION_MAIN_MOBILE_STYLE
        )}
      >
        {renderUpdateDetail}
        <Button
          className={clsx("!w-fit", type !== "mobile" ? "self-end" : "!mt-4")}
          onClick={handleReadNotification}
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
