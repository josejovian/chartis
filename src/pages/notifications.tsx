import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { BatchOperationType, updateData, writeDataBatch } from "@/utils";
import clsx from "clsx";
import {
  LayoutTemplateCard,
  PageNotificationsCard,
  TemplatePageGuestNotAllowed,
} from "@/components";
import {
  useAuthorization,
  useIdentification,
  useNotification,
  useScreen,
  useToast,
} from "@/hooks";
import { FIREBASE_COLLECTION_USERS } from "@/consts";
import { ResponsiveStyleType } from "@/types";
import { getAuth } from "firebase/auth";

export default function NotificationPage() {
  const { addToastPreset } = useToast();
  const auth = getAuth();
  const { stateIdentification } = useIdentification();
  const [{ user }] = stateIdentification;
  const router = useRouter();
  const { type } = useScreen();
  const { notification, setNotification } = useNotification();
  const [isLoading] = useState(false);
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "user",
  });

  const handleReadAllNotifications = useCallback(async () => {
    if (!user) return;
    const batchOperations: BatchOperationType[] = [];
    notification.forEach((notification) => {
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
        setNotification([]);
      })
      .catch(() => {
        addToastPreset("fail-post");
      });
  }, [addToastPreset, notification, setNotification, user]);

  const handleReadNotification = useCallback(
    async (targetEventId: string, targetEventVersion: number) => {
      if (!user) return;

      return updateData(FIREBASE_COLLECTION_USERS, user.id, {
        [`subscribedEvents.${targetEventId}`]: targetEventVersion,
        [`unseenEvents.${targetEventId}`]: false,
      })
        .then(() => {
          setNotification((prev) =>
            prev.filter(
              (notification) => notification.eventId !== targetEventId
            )
          );
        })
        .catch(() => {
          addToastPreset("fail-post");
        });
    },
    [addToastPreset, setNotification, user]
  );

  const renderNotification = useMemo(
    () => (
      <PageNotificationsCard
        updateData={notification}
        handleReadAllNotifications={handleReadAllNotifications}
        handleReadNotification={handleReadNotification}
        className={clsx("!bg-sky-50 h-full", type === "mobile" && "pt-8")}
        isLoading={isLoading}
      />
    ),
    [
      handleReadAllNotifications,
      handleReadNotification,
      isLoading,
      notification,
      type,
    ]
  );

  return (
    <LayoutTemplateCard
      title="Updates"
      htmlTitle="Updates"
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
      minPermission="user"
      authorized={isAuthorized}
      unauthorizedElement={<TemplatePageGuestNotAllowed />}
    >
      {renderNotification}
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
