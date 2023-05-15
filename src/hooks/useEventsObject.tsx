import { EventsContext } from "@/contexts";
import { EventType } from "@/types";
import { useCallback, useContext, useMemo } from "react";

export function useEventsObject() {
  const { stateEventsObject, stateSubscribedIds } = useContext(EventsContext);
  const [eventsObject, setEventsObject] = stateEventsObject;
  const [subscribedIds, setSubscribedIds] = stateSubscribedIds;

  const eventsArray = useMemo(
    () => Object.values(eventsObject),
    [eventsObject]
  );

  const setEventsObjectFromArray = useCallback(
    (array: EventType[]) => {
      setEventsObject(
        array.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.id]: curr,
          }),
          {}
        )
      );
    },
    [setEventsObject]
  );

  const setEventSingle = useCallback(
    (eventId: string, event: EventType) => {
      setEventsObject((prev) => ({
        ...prev,
        [eventId]: event,
      }));
    },
    [setEventsObject]
  );

  const updateClientSideEvent = useCallback(
    (eventId: string, event: Partial<EventType>) => {
      setEventsObject((prev) => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          ...event,
        },
      }));
    },
    [setEventsObject]
  );

  const deleteClientSideEvent = useCallback(
    (eventId: string) => {
      setEventsObject((prev) => {
        const temp = { ...prev };
        delete temp[eventId];
        return temp;
      });
    },
    [setEventsObject]
  );

  const updateUserSubscribedEventClientSide = useCallback(
    (eventId: string, version?: number) => {
      setSubscribedIds((prev) => ({
        ...prev,
        ...(typeof version === "number"
          ? {
              [eventId]: version,
            }
          : (() => {
              const temp = subscribedIds;
              delete (temp ?? {})[eventId];
              return temp;
            })()),
      }));
    },
    [setSubscribedIds, subscribedIds]
  );

  return useMemo(
    () => ({
      stateEventsObject,
      eventsArray,
      setEventSingle,
      setEventsObjectFromArray,
      stateSubscribedIds,
      updateClientSideEvent,
      deleteClientSideEvent,
      updateUserSubscribedEventClientSide,
    }),
    [
      deleteClientSideEvent,
      eventsArray,
      setEventSingle,
      setEventsObjectFromArray,
      stateSubscribedIds,
      stateEventsObject,
      updateClientSideEvent,
      updateUserSubscribedEventClientSide,
    ]
  );
}
