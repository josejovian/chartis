import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  BatchOperationType,
  readData,
  updateData,
  writeDataBatch,
} from "@/firebase";
import clsx from "clsx";
import { LayoutTemplateCard, PageNotificationsCard } from "@/components";
import {
  useIdentification,
  useNotification,
  useScreen,
  useToast,
} from "@/hooks";
import { FIREBASE_COLLECTION_USERS } from "@/consts";
import {
  UpdateNameType,
  UpdateChangedValueType,
  ResponsiveStyleType,
  NotificationData,
} from "@/types";

export default function Notification() {
  const { addToastPreset } = useToast();
  const { stateIdentification } = useIdentification();
  const [{ user }] = stateIdentification;
  const router = useRouter();
  const { type } = useScreen();
  const { updates: userNotification } = useNotification();

  const [notificationData, setNotificationData] = useState<NotificationData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleUpdateNotifications = useCallback(async () => {
    if (!isLoading) return null;
    if (!user) return null;

    const newUserData = await readData(FIREBASE_COLLECTION_USERS, user.id);

    if (!newUserData) return null;

    const { subscribedEvents = {}, unseenEvents = {} } = newUserData;
    const subscribedEventIds = Object.keys(subscribedEvents);

    const notificationUpdates: NotificationData[] = [];

    if (
      Object.entries(unseenEvents).length > 0 &&
      subscribedEventIds.length > 0
    ) {
      for (const eventId of Object.keys(unseenEvents)) {
        const lastSeenVersion = subscribedEvents[eventId];
        const newEvent = await readData("events", eventId);
        if (
          newEvent &&
          newEvent.version &&
          newEvent.version > lastSeenVersion
        ) {
          const eventUpdates = await readData("updates", eventId);

          if (eventUpdates) {
            const unseenBatches = eventUpdates.updates.slice(lastSeenVersion);

            const unseenUpdates: Partial<
              Record<UpdateNameType, UpdateChangedValueType>
            > = {};

            unseenBatches
              .map((batch) => batch.updates)
              .forEach((batchUpdate) => {
                (
                  Object.entries(batchUpdate) as [
                    UpdateNameType,
                    UpdateChangedValueType
                  ][]
                ).forEach(([type, changes]) => {
                  if (!unseenUpdates[type]) {
                    unseenUpdates[type] = {
                      ...changes,
                    };
                  } else {
                    unseenUpdates[type] = {
                      ...unseenUpdates[type],
                      valueNew: changes.valueNew,
                    };
                  }
                });
              });

            const diffObject: NotificationData = {
              eventId: newEvent.id,
              eventVersion: newEvent.version,
              authorId: newEvent.authorId,
              eventName: newEvent.name,
              lastUpdatedAt: newEvent.lastUpdatedAt ?? 0,
              changes: unseenUpdates,
            };

            notificationUpdates.push(diffObject);
          }
        }
      }

      notificationUpdates.sort((a, b) => {
        if (a.lastUpdatedAt > b.lastUpdatedAt) {
          return -1;
        }
        if (a.lastUpdatedAt < b.lastUpdatedAt) {
          return 1;
        }
        return 0;
      });

      setNotificationData(notificationUpdates);
    }

    setNotificationData(notificationUpdates);
    setIsLoading(false);
  }, [isLoading, user]);

  const handleReadAllNotifications = useCallback(async () => {
    if (!user) return;
    const batchOperations: BatchOperationType[] = [];
    notificationData.forEach((notification) => {
      batchOperations.push({
        collectionName: FIREBASE_COLLECTION_USERS,
        documentId: user.id,
        operationType: "update",
        value: {
          [`subscribedEvents.${notification.eventId}`]:
            notification.eventVersion,
          [`unseenEvents.${notification.eventId}`]: false,
        },
      });
    });

    return writeDataBatch(batchOperations)
      .then(() => {
        setNotificationData([]);
      })
      .catch(() => {
        addToastPreset("fail-post");
      });
  }, [addToastPreset, notificationData, user]);

  const handleReadNotification = useCallback(
    async (targetEventId: string, targetEventVersion: number) => {
      if (!user) return;

      return updateData(FIREBASE_COLLECTION_USERS, user.id, {
        [`subscribedEvents.${targetEventId}`]: targetEventVersion,
        [`unseenEvents.${targetEventId}`]: false,
      })
        .then(() => {
          setNotificationData((prev) =>
            prev.filter(
              (notification) => notification.eventId !== targetEventId
            )
          );
        })
        .catch(() => {
          addToastPreset("fail-post");
        });
    },
    [addToastPreset, user]
  );

  useEffect(() => {
    handleUpdateNotifications();
  }, [handleUpdateNotifications, userNotification]);

  return (
    <LayoutTemplateCard
      title="Updates"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={clsx(
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type],
        "!pb-0"
      )}
    >
      <PageNotificationsCard
        updateData={notificationData}
        handleReadAllNotifications={handleReadAllNotifications}
        handleReadNotification={handleReadNotification}
        className={clsx("!bg-sky-50 h-full", type === "mobile" && "pt-8")}
        isLoading={isLoading}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
