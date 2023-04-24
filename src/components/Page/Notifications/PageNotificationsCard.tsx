import { useCallback, useMemo } from "react";
import clsx from "clsx";
import { LayoutCard, LayoutNotice, NotificationCard } from "@/components";
import { useIdentification, useNotification, useToast } from "@/hooks";
import { Button } from "semantic-ui-react";
import { useRouter } from "next/router";
import { EventUpdateBatchType, UserType } from "@/types";
import { doc, increment, runTransaction, updateDoc } from "firebase/firestore";
import { fs } from "@/firebase";
import { FIREBASE_COLLECTION_USERS } from "@/consts";

export interface PageNotificationsCardProps {
  className?: string;
}

export function PageNotificationsCard({
  className,
}: PageNotificationsCardProps) {
  const { updates, setUpdates } = useNotification();
  const { addToastPreset } = useToast();

  const {
    stateIdentification,
    updateUserSubscribedEventClientSide,
    updateUserSubscribedEventsClientSide,
  } = useIdentification();
  const [{ user }] = stateIdentification;
  const router = useRouter();

  const handleReadNotification = useCallback(
    async (update: EventUpdateBatchType) => {
      const { eventId, version } = update;

      if (!user || !version) return;

      const userRef = doc(fs, FIREBASE_COLLECTION_USERS, user.uid);

      try {
        await runTransaction(fs, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          if (!userDoc.exists()) {
            throw Error("Document does not exist!");
          }

          const userData = userDoc.data() as UserType;

          transaction.update(userRef, {
            ...(() => {
              const evts = userData.unseenEvents ?? {};
              delete evts[eventId];
              return evts;
            })(),
            [`subscribedEvents.${eventId}`]: version,
            notificationCount: increment(-1),
          });
        });
      } catch (e) {
        addToastPreset("post-fail");
      }

      setUpdates((prev) =>
        prev.filter((instance) => instance.eventId !== eventId)
      );

      updateUserSubscribedEventClientSide(user.uid, eventId, version);
    },
    [addToastPreset, setUpdates, updateUserSubscribedEventClientSide, user]
  );

  const handleReadAndViewNotification = useCallback(
    async (update: EventUpdateBatchType) => {
      router.push(`/events/${update.eventId}`);
      await handleReadNotification(update);
    },
    [handleReadNotification, router]
  );

  const handleReadAllNotification = useCallback(async () => {
    if (!user) return;

    const userRef = doc(fs, FIREBASE_COLLECTION_USERS, user.uid);

    const lastSeenVersions = Object.entries(updates)
      .filter(([_, batch]) => batch.version !== undefined)
      .reduce(
        (prev, [_, batch]) => ({
          ...prev,
          [`subscribedEvents.${batch.eventId}`]: batch.version,
        }),
        {}
      );

    await updateDoc(userRef, {
      ...lastSeenVersions,
      notificationCount: increment(-1 * updates.length),
    }).catch(() => {
      addToastPreset("post-fail");
    });

    updateUserSubscribedEventsClientSide(user.uid, lastSeenVersions);

    setUpdates((prev) =>
      prev.filter(
        (instance) => !Object.keys(updates).includes(instance.eventId)
      )
    );
  }, [
    addToastPreset,
    setUpdates,
    updateUserSubscribedEventsClientSide,
    updates,
    user,
  ]);

  const renderNotifications = useMemo(
    () => (
      <>
        <div className="h-full">
          <div className="flex flex-row items-center justify-between px-4 pb-8">
            <span className="text-16px">
              You have {updates.length} unread notifications.
            </span>
            <Button onClick={handleReadAllNotification} color="yellow">
              Mark All as Read
            </Button>
          </div>
          <div
            className={NOTIFICATION_LIST_STYLE}
            style={{ height: "calc(100% - 73.13px)" }}
          >
            {updates.map((update) => (
              <NotificationCard
                key={`Update_${update.eventId}-${update.id}`}
                update={update}
                handleReadNotification={() => handleReadNotification(update)}
                handleReadAndViewNotification={() =>
                  handleReadAndViewNotification(update)
                }
              />
            ))}
          </div>
        </div>
      </>
    ),
    [
      handleReadAllNotification,
      handleReadAndViewNotification,
      handleReadNotification,
      updates,
    ]
  );

  const renderEmptyNotifications = useMemo(
    () => (
      <LayoutNotice
        title="All Clear!"
        description="You will see future updates of events you follow here."
      />
    ),
    []
  );

  return (
    <LayoutCard className={className}>
      {updates.length > 0 ? renderNotifications : renderEmptyNotifications}
    </LayoutCard>
  );
}

const NOTIFICATION_LIST_STYLE = clsx(
  "flex flex-col overflow-y-auto",
  "px-4 pt-0.5 mr-4"
);
