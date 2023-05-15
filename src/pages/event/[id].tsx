import { useRouter } from "next/router";
import {
  LayoutNotice,
  LayoutTemplateCard,
  PageViewEventCard,
} from "@/components";
import { ASSET_NO_CONTENT, EVENT_DUMMY_1 } from "@/consts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIdentification, useScreen } from "@/hooks";
import { EventModeType, EventType, ResponsiveStyleType } from "@/types";
import { Button } from "semantic-ui-react";
import { readData } from "@/firebase";
import clsx from "clsx";
import { useEventsObject } from "@/hooks/useEventsObject";

export default function ViewEvent() {
  const router = useRouter();
  const { id } = router.query;
  const stateMode = useState<EventModeType>("view");
  const setMode = stateMode[1];
  const { width, type } = useScreen();
  const [loading, setLoading] = useState(true);
  const {
    stateEventsObject,
    setEventSingle,
    updateClientSideEvent,
    stateSubscribedIds,
    updateUserSubscribedEventClientSide,
  } = useEventsObject();
  const subscribedIds = stateSubscribedIds[0];

  const eventsObject = stateEventsObject[0];
  const event = useMemo(
    () => (loading ? undefined : eventsObject[id as string]),
    [eventsObject, id, loading]
  );
  const stateEvent = useState(EVENT_DUMMY_1);
  const setEvent = stateEvent[1];

  const eventPreviousValues = useRef<EventType>(EVENT_DUMMY_1);
  const [error, setError] = useState(false);

  const { stateIdentification } = useIdentification();
  const { user } = stateIdentification[0];

  const checkForSubscribed = useCallback(
    (id: string) => {
      const value = Boolean(typeof subscribedIds[id] === "number");

      return value;
    },
    [subscribedIds]
  );

  const handleGetEvent = useCallback(async () => {
    if (!id) return;

    await readData("events", id as string)
      .then((result) => {
        if (result) {
          setError(false);
          setEvent(result);
          setEventSingle(id as string, result);
          eventPreviousValues.current = result;
        } else {
          throw Error("Invalid event data.");
        }
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, setEvent, setEventSingle]);

  const handleInstantEdit = useCallback(() => {
    if (
      router.query.mode === "edit" &&
      event &&
      user &&
      user.id === event.authorId
    ) {
      const { pathname, query } = router;
      delete router.query.shouldRefetchUser;
      router.replace({ pathname, query }, undefined, { shallow: true });
      setMode("edit");
    }
  }, [event, router, setMode, user]);

  useEffect(() => {
    handleGetEvent();
  }, [handleGetEvent]);

  useEffect(() => {
    handleInstantEdit();
  }, [handleInstantEdit]);

  const renderContent = useMemo(() => {
    if (loading) return <LayoutNotice preset="loader" />;

    if (error)
      return (
        <LayoutNotice
          illustration={ASSET_NO_CONTENT}
          title="This event does not exist."
          descriptionElement={
            <Button color="yellow" onClick={() => router.push("/")}>
              Go to Home
            </Button>
          }
        />
      );

    return (
      <PageViewEventCard
        stateEvent={stateEvent}
        stateIdentification={stateIdentification}
        eventPreviousValues={eventPreviousValues}
        stateMode={stateMode}
        subscribed={checkForSubscribed(id as string)}
        width={width}
        type={type}
        updateUserSubscribedEventClientSide={
          updateUserSubscribedEventClientSide
        }
        updateClientSideEvent={updateClientSideEvent}
      />
    );
  }, [
    checkForSubscribed,
    error,
    id,
    loading,
    router,
    stateEvent,
    stateIdentification,
    stateMode,
    type,
    updateClientSideEvent,
    updateUserSubscribedEventClientSide,
    width,
  ]);

  return (
    <LayoutTemplateCard
      title="Event"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={clsx(
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type],
        "ViewEvent"
      )}
    >
      {renderContent}
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
