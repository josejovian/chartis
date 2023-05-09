import { useRouter } from "next/router";
import {
  LayoutNotice,
  LayoutTemplateCard,
  PageViewEventCard,
} from "@/components";
import { ASSET_NO_CONTENT, EVENT_DUMMY_1 } from "@/consts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIdentification, useScreen, useEvent } from "@/hooks";
import { EventModeType, EventType, ResponsiveStyleType } from "@/types";
import { Button } from "semantic-ui-react";
import { readData } from "@/firebase";

export default function ViewEvent() {
  const router = useRouter();
  const { id } = router.query;

  const { handleUpdateEvent } = useEvent({});
  const stateMode = useState<EventModeType>("view");
  const setMode = stateMode[1];
  const stateActiveTab = useState(0);
  const { type } = useScreen();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeTab = stateActiveTab[0];

  const stateEvent = useState(EVENT_DUMMY_1);
  const [event, setEvent] = stateEvent;
  const eventPreviousValues = useRef<EventType>(EVENT_DUMMY_1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { stateIdentification, updateUserSubscribedEventClientSide } =
    useIdentification();
  const { user } = stateIdentification[0];

  const handleGetEvent = useCallback(async () => {
    if (!id) return;

    await readData("events", id as string)
      .then((result) => {
        setLoading(false);
        if (result) {
          setError(false);
          setEvent(result);
          eventPreviousValues.current = result;
        } else {
          throw Error("Invalid event data.");
        }
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  }, [id, setEvent]);

  const handleInstantEdit = useCallback(() => {
    if (
      router.query.mode === "edit" &&
      event &&
      user &&
      user.id === event.authorId
    ) {
      setMode("edit");
    }
  }, [event, router.query.mode, setMode, user]);

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
        className="card ui"
        stateEvent={stateEvent}
        stateIdentification={stateIdentification}
        eventPreviousValues={eventPreviousValues}
        stateMode={stateMode}
        type={type}
        updateEvent={handleUpdateEvent}
        updateUserSubscribedEventClientSide={
          updateUserSubscribedEventClientSide
        }
      />
    );
  }, [
    error,
    handleUpdateEvent,
    loading,
    router,
    stateEvent,
    stateIdentification,
    stateMode,
    type,
    updateUserSubscribedEventClientSide,
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
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
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
