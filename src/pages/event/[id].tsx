import { useRouter } from "next/router";
import {
  LayoutNotice,
  LayoutTemplateCard,
  PageViewEventCard,
} from "@/components";
import { ASSET_NO_CONTENT, EVENT_EMPTY } from "@/consts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIdentification, useScreen, useEventsObject } from "@/hooks";
import { EventModeType, EventType, ResponsiveStyleType } from "@/types";
import { Button } from "semantic-ui-react";
import { readData } from "@/utils";
import clsx from "clsx";

export default function ViewEventPage() {
  const router = useRouter();
  const { id } = router.query;
  const stateMode = useState<EventModeType>("view");
  const [mode, setMode] = stateMode;
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
  const queryRef = useRef([false, false]);

  const eventsObject = stateEventsObject[0];
  const event = useMemo(
    () => (loading ? undefined : eventsObject[id as string]),
    [eventsObject, id, loading]
  );
  const stateEvent = useState(EVENT_EMPTY);
  const setEvent = stateEvent[1];

  const eventPreviousValues = useRef<EventType>(EVENT_EMPTY);
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
    if (event && user && user.id === event.authorId) {
      const { pathname, query } = router;

      if (query.mode === "edit") {
        if (queryRef.current[0]) return;
        queryRef.current[0] = true;
      } else {
        if (queryRef.current[1]) return;
        queryRef.current[1] = true;
      }

      if (!query.mode || query.mode === mode) return;

      delete router.query.shouldRefetchUser;

      const newQuery = query;
      if (mode !== "edit") {
        newQuery.mode = "edit";
        setMode("edit");
      } else {
        delete newQuery.mode;
        setMode("view");
      }

      router.replace(
        {
          pathname,
          query: newQuery,
        },
        undefined,
        { shallow: true }
      );
    }
  }, [event, mode, router, setMode, user]);

  useEffect(() => {
    handleGetEvent();
  }, [handleGetEvent]);

  useEffect(() => {
    handleInstantEdit();
  }, [router, mode, handleInstantEdit]);

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
      htmlTitle={error || !event ? "Event Not Found" : event.name}
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
