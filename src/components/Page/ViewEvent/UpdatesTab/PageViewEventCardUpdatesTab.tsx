import { useCallback, useEffect, useMemo, useState } from "react";
import { EventType, EventUpdateBatchType } from "@/types";
import clsx from "clsx";
import { FIREBASE_COLLECTION_UPDATES } from "@/consts";
import { fs } from "@/firebase";
import { EventUpdate } from "@/components/Event/Update";
import { query, orderBy, collection, where, getDocs } from "firebase/firestore";

interface PageViewEventCardUpdatesTabProps {
  event: EventType;
}

export function PageViewEventCardUpdatesTab({
  event,
}: PageViewEventCardUpdatesTabProps) {
  const [updates, setUpdates] = useState<EventUpdateBatchType[]>();

  const handleGetEventUpdates = useCallback(async () => {
    const updatesRef = collection(fs, FIREBASE_COLLECTION_UPDATES);

    const eventUpdatesQuery = query(
      updatesRef,
      where("eventId", "==", event.id),
      orderBy("date", "desc")
    );

    const eventUpdates = (await getDocs(eventUpdatesQuery)).docs;

    setUpdates(
      eventUpdates.map((update) => update.data()) as EventUpdateBatchType[]
    );
  }, [event]);

  useEffect(() => {
    handleGetEventUpdates();
  }, [handleGetEventUpdates]);

  const renderEventUpdates = useMemo(
    () =>
      updates &&
      updates.map(
        (batch, idx2) =>
          batch &&
          batch.updates.map((_, idx) => (
            <EventUpdate
              key={`Update_${batch.id}_${idx}`}
              batch={batch}
              idx={idx}
              last={
                idx2 === updates.length - 1 && idx === batch.updates.length - 1
              }
            />
          ))
      ),
    [updates]
  );

  // return <div className="pt-8 px-16 overflow-y">{renderEventUpdates}</div>;

  return (
    <div className={clsx(EVENT_CARD_BODY_WRAPPER_STYLE)}>
      {renderEventUpdates}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-6 pb-6 overflow-y-auto";
