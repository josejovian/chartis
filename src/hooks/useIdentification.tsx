import { IdentificationContext } from "@/contexts";
import { useCallback, useContext, useMemo } from "react";

export function useIdentification() {
  const stateIdentification = useContext(IdentificationContext);
  const setIdentification = stateIdentification[1];

  const updateUserSubscribedEventClientSide = useCallback(
    (userId: string, eventId: string, version?: number) => {
      setIdentification((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          [userId]: {
            ...prev.users[userId],
            subscribedEvents: {
              ...prev.users[userId].subscribedEvents,
              ...(version === undefined
                ? (() => {
                    const temp = prev.users[userId].subscribedEvents ?? {};
                    delete temp[eventId];
                    return temp;
                  })()
                : {
                    [eventId]: version,
                  }),
            },
          },
        },
      }));
    },
    [setIdentification]
  );

  const updateUserSubscribedEventsClientSide = useCallback(
    (userId: string, versions: Record<string, number>) => {
      setIdentification((prev) => ({
        ...prev,
        users: {
          ...prev.users,
          [userId]: {
            ...prev.users[userId],
            subscribedEvents: {
              ...prev.users[userId].subscribedEvents,
              ...versions,
            },
          },
        },
      }));
    },
    [setIdentification]
  );

  return useMemo(
    () => ({
      stateIdentification,
      updateUserSubscribedEventClientSide,
      updateUserSubscribedEventsClientSide,
    }),
    [
      stateIdentification,
      updateUserSubscribedEventClientSide,
      updateUserSubscribedEventsClientSide,
    ]
  );
}
