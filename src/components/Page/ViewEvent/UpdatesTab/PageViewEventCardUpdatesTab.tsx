import { useCallback, useEffect, useMemo, useState } from "react";
import { readData } from "@/firebase";
import clsx from "clsx";
import { EventUpdate } from "@/components";
import {
  EventType,
  UpdateNameType,
  ScreenSizeCategoryType,
  UpdateVersion,
} from "@/types";

interface PageViewEventCardUpdatesTabProps {
  event: EventType;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCardUpdatesTab({
  event,
  type,
}: PageViewEventCardUpdatesTabProps) {
  const [updates, setUpdates] = useState<UpdateVersion[]>();

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
                key={`Update_${batch.updateId}_${idx}`}
                authorId={event.authorName}
                date={batch.date}
                eventId={event.id}
                type={type as UpdateNameType}
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
    [event.authorName, event.id, updates]
  );

  return (
    <div
      className={clsx(
        EVENT_CARD_BODY_WRAPPER_STYLE,
        type === "mobile" && "!px-6"
      )}
    >
      {renderEventUpdates}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-6 pb-6 overflow-y-auto";
