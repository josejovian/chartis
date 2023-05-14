import { EventType } from "@/types";
import { useCallback, useMemo, useState } from "react";

export function useEventsObject() {
  const stateEventsObject = useState<Record<string, EventType>>({});
  const [eventsObject, setEventsObject] = stateEventsObject;
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

  return useMemo(
    () => ({
      stateEventsObject,
      eventsArray,
      setEventSingle,
      setEventsObjectFromArray,
      updateClientSideEvent,
      deleteClientSideEvent,
    }),
    [
      deleteClientSideEvent,
      eventsArray,
      setEventSingle,
      setEventsObjectFromArray,
      stateEventsObject,
      updateClientSideEvent,
    ]
  );
}
