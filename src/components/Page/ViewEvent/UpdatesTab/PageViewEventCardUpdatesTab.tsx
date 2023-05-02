import { useCallback, useEffect, useMemo, useState } from "react";
import { readData } from "@/firebase";
import clsx from "clsx";
import { EventUpdate } from "@/components";
import { EventType, EventUpdateBatchType, EventUpdateNameType } from "@/types";

interface PageViewEventCardUpdatesTabProps {
  event: EventType;
}

export function PageViewEventCardUpdatesTab({
  event,
}: PageViewEventCardUpdatesTabProps) {
  const [updates, setUpdates] = useState<EventUpdateBatchType[]>();

  const handleGetEventUpdates = useCallback(async () => {
    if (event.version === 0) return;

    const eventUpdates = await readData("updates", event.id);

    if (eventUpdates) setUpdates(eventUpdates.updates);
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
          Object.entries(batch.updates).map(
            ([type, { valueNew, valuePrevious }], idx) => (
              <EventUpdate
                key={`Update_${batch.id}_${idx}`}
                authorId={batch.authorId}
                date={batch.date}
                eventId={batch.eventId}
                type={type as EventUpdateNameType}
                valueNew={valueNew}
                valuePrevious={valuePrevious}
                last={
                  idx2 === updates.length - 1 &&
                  idx === Object.keys(batch.updates).length - 1
                }
              />
            )
          )
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
