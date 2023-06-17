import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { EventUpdate, LayoutNotice } from "@/components";
import {
  EventType,
  UpdateNameType,
  ScreenSizeCategoryType,
  UpdateVersion,
} from "@/types";
import { readData } from "@/utils";
import { ASSET_CALENDAR, FIREBASE_COLLECTION_UPDATES } from "@/consts";
import { useToast } from "@/hooks";
import { Loader } from "semantic-ui-react";

interface PageViewEventCardUpdatesTabProps {
  event: EventType;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCardUpdatesTab({
  event,
  type,
}: PageViewEventCardUpdatesTabProps) {
  const [updates, setUpdates] = useState<UpdateVersion[]>();
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);
  const { addToastPreset } = useToast();

  const handleGetEventUpdates = useCallback(async () => {
    if (event.version === 0) {
      setIsLoading(false);
      return;
    }

    readData(FIREBASE_COLLECTION_UPDATES, event.id)
      .then((eventUpdates) => {
        if (eventUpdates) {
          setUpdates(eventUpdates.updates.sort((a, b) => b.date - a.date));
          setIsEmpty(false);
        }
      })
      .catch(() => {
        addToastPreset("fail-get");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [addToastPreset, event.id, event.version]);

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
                authorId={batch.authorId}
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
    [event.id, updates]
  );

  return (
    <div
      className={clsx(
        EVENT_CARD_BODY_WRAPPER_STYLE,
        type === "mobile" && "!px-6"
      )}
    >
      {isLoading ? (
        <Loader active={isLoading} inline="centered" />
      ) : isEmpty ? (
        <LayoutNotice
          illustration={ASSET_CALENDAR}
          title="All Clear!"
          description="This event have never been modified."
        />
      ) : (
        renderEventUpdates
      )}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-6 pb-6 overflow-y-auto";
