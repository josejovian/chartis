import { useRouter } from "next/router";
import { LayoutTemplateCard, PageNotificationsCard } from "@/components";
import { useIdentification, useNotification, useScreen } from "@/hooks";
import {
  EventType,
  EventUpdateArrayType,
  UpdateNameType,
  UpdateChangedValueType,
  ResponsiveStyleType,
  NotificationData,
} from "@/types";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import {
  BatchOperationType,
  readData,
  updateData,
  writeDataBatch,
} from "@/firebase";
import {
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";
import { documentId, where } from "firebase/firestore";

export default function Notification() {
  const { stateIdentification } = useIdentification();
  const [{ user }] = stateIdentification;
  const router = useRouter();
  const { type } = useScreen();
  const { updates: userNotification } = useNotification();
  const [notificationData, setNotificationData] = useState<NotificationData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const getUpdateObject = useCallback(
    async (eventId: string[]): Promise<NotificationData[]> => {
      const eventData: { [eventId: string]: EventType } = await readData(
        FIREBASE_COLLECTION_EVENTS,
        [where(documentId(), "in", eventId)]
      ).then((eventData) =>
        (eventData as EventType[]).reduce((obj, x) => {
          return { ...obj, [x.id]: x };
        }, {})
      );
      const updateData: {
        [eventId: string]: {
          date: number;
          updateId: string;
          updates: Partial<Record<UpdateNameType, UpdateChangedValueType>>;
        }[];
      } = await readData(FIREBASE_COLLECTION_UPDATES, [
        where(documentId(), "in", eventId),
      ]).then((updateData) =>
        (updateData as EventUpdateArrayType[]).reduce((obj, x) => {
          return { ...obj, [x.eventId]: x.updates };
        }, {})
      );

      const notificationData = [] as NotificationData[];
      userNotification.forEach((notification) => {
        const unseenChanges = updateData[notification.eventId].slice(
          notification.lastSeenVersion
        );
        const differences: Partial<
          Record<UpdateNameType, UpdateChangedValueType>
        > = {};

        unseenChanges
          .map((batch) => batch.updates)
          .forEach((batchUpdate) => {
            (
              Object.entries(batchUpdate) as [
                UpdateNameType,
                UpdateChangedValueType
              ][]
            ).forEach(([type, changes]) => {
              if (!differences[type]) {
                differences[type] = {
                  ...changes,
                };
              } else {
                differences[type] = {
                  ...differences[type],
                  valueNew: changes.valueNew,
                };
              }
            });
          });

        const diffObject: NotificationData = {
          eventId: notification.eventId,
          eventVersion: eventData[notification.eventId].version as number,
          authorName: eventData[notification.eventId].authorName,
          eventName: eventData[notification.eventId].name,
          lastUpdatedAt: eventData[notification.eventId]
            .lastUpdatedAt as number,
          changes: differences,
        };

        notificationData.push(diffObject);
      });

      return notificationData;
    },
    [userNotification]
  );

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
        addToastPreset("post-fail");
      });
  }, [notificationData, user]);

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
          addToastPreset("post-fail");
        });
    },
    [user]
  );

  useEffect(() => {
    if (userNotification.length > 0) {
      const updateEventId = userNotification.reduce(
        (filtered, notification) => {
          if (notification.unseen) filtered.push(notification.eventId);
          return filtered;
        },
        [] as string[]
      );
      if (updateEventId.length > 0) {
        setIsLoading(true);
        getUpdateObject(updateEventId).then((notificationData) => {
          setNotificationData(notificationData);
        });
      }
    }

    setIsLoading(false);
  }, [getUpdateObject, userNotification]);

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
        udpateData={notificationData}
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
function addToastPreset(arg0: string) {
  throw new Error("Function not implemented.");
}
