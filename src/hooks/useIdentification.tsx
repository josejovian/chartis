import { IdentificationContext } from "@/contexts";
import { UserType } from "@/types";
import { useCallback, useContext, useEffect, useMemo } from "react";

export function useIdentification() {
  const stateIdentification = useContext(IdentificationContext);
  const { user, users } = useMemo(
    () => stateIdentification[0],
    [stateIdentification]
  );
  const setIdentification = useMemo(
    () => stateIdentification[1],
    [stateIdentification]
  );

  const updateUserSubscribedEventClientSide = useCallback(
    (eventId: string, version?: number) => {
      if (!user) return;

      console.log(version);
      console.log(user);

      if (version) {
        setIdentification((prev) => ({
          ...prev,
          user: {
            ...(prev.user ?? user),
            ...{
              [eventId]: version,
            },
          },
        }));
      } else {
        setIdentification((prev) => ({
          ...prev,
          user: {
            ...(prev.user ?? user),
            ...(() => {
              const temp = prev.user ? prev.user.subscribedEvents : {};
              delete (temp ?? {})[eventId];
              return temp;
            })(),
          },
        }));
      }
    },
    [setIdentification, user]
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
