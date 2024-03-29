import { useCallback, useContext, useMemo } from "react";
import { NotificationContext } from "@/contexts";
import { readData } from "@/utils";
import {
  NotificationData,
  UpdateChangedValueType,
  UpdateNameType,
  UserType,
} from "@/types";

export function useNotification() {
  const { stateNotification } = useContext(NotificationContext);
  const [notification, setNotification] = stateNotification;

  const handleUpdateNotifications = useCallback(async (user?: UserType) => {
    if (!user) return null;

    const { subscribedEvents = {}, unseenEvents = {} } = user;
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
    }

    return notificationUpdates;
  }, []);

  return useMemo(
    () => ({
      notification,
      setNotification,
      handleUpdateNotifications,
    }),
    [notification, setNotification, handleUpdateNotifications]
  );
}
