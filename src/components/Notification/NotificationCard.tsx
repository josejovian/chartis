import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { doc, updateDoc } from "firebase/firestore";
import { fs } from "@/firebase";
import clsx from "clsx";
import { Button } from "semantic-ui-react";
import { UserPicture } from "@/components";
import { useIdentification, useScreen } from "@/hooks";
import { getTimeDifference } from "@/utils";
import { EVENT_UPDATE_TERM, FIREBASE_COLLECTION_USERS } from "@/consts";
import {
  EventUpdateBatchType,
  EventUpdateNameType,
  EventUpdateType,
} from "@/types";

interface NotificationCardProps {
  update: EventUpdateBatchType;
  setUpdates: Dispatch<SetStateAction<EventUpdateBatchType[]>>;
}

export function NotificationCard({
  update,
  setUpdates,
}: NotificationCardProps) {
  const { authorId, eventId, updates, date, id, version } = update;
  const { type } = useScreen();
  const [{ user }] = useIdentification();
  const router = useRouter();

  const handleReadNotification = useCallback(async () => {
    if (!user || !version) return;

    const userRef = doc(fs, FIREBASE_COLLECTION_USERS, user.uid);

    await updateDoc(userRef, {
      [`subscribedEvents.${eventId}`]: version,
    });

    setUpdates((prev) =>
      prev.filter((instance) => instance.eventId !== eventId)
    );
  }, [eventId, setUpdates, user, version]);

  const handleReadAndViewNotification = useCallback(async () => {
    router.push(`/events/${eventId}`);
    await handleReadNotification();
  }, [eventId, handleReadNotification, router]);

  const renderChangeList = useMemo(
    () => (
      <ul className={NOTIFICATION_CHANGES_LIST_STYLE}>
        {(
          Object.entries(updates) as [EventUpdateNameType, EventUpdateType][]
        ).map(([updateType, { valuePrevious, valueNew }], idx) => (
          <li
            className={clsx(idx > 0 && "mt-2", "pr-8")}
            key={`Update_${id}_${idx}`}
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
    [id, updates]
  );

  const renderUpdateDetail = useMemo(
    () => (
      <div className="break-words w-full pr-8">
        <Link href="#" onClick={handleReadAndViewNotification}>
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
    <article
      className={clsx(
        NOTIFICATION_CARD_BASE_STYLE,
        type !== "mobile"
          ? NOTIFICATION_CARD_DESKTOP_STYLE
          : NOTIFICATION_CARD_MOBILE_STYLE
      )}
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
    </article>
  );
}

export const NOTIFICATION_CARD_BASE_STYLE =
  "NotificationCard ui fluid card w-full !break-words !flex-row !py-5";

export const NOTIFICATION_CARD_DESKTOP_STYLE = "!px-10";

export const NOTIFICATION_CARD_MOBILE_STYLE = "!px-5";

export const NOTIFICATION_MAIN_BASE_STYLE = "flex mt-1 w-full";

export const NOTIFICATION_MAIN_DESKTOP_STYLE = "flex-row pl-10";

export const NOTIFICATION_MAIN_MOBILE_STYLE = "flex-row pl-5";

export const NOTIFICATION_CHANGES_LIST_STYLE = "mb-2 w-full pl-8";
