import { useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import {
  LayoutTemplateCard,
  PageViewEventCard,
  TemplatePageGuestNotAllowed,
} from "@/components";
import {
  useScreen,
  useEvent,
  useIdentification,
  useAuthorization,
} from "@/hooks";
import { EVENT_EMPTY } from "@/consts";
import { EventModeType, ResponsiveStyleType } from "@/types";

export default function CreateEvent() {
  const auth = getAuth();
  const router = useRouter();

  const { handleUpdateEvent } = useEvent({});
  const { type } = useScreen();
  const { updateUserSubscribedEventClientSide } = useIdentification();
  const { stateIdentification } = useIdentification();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "user",
  });

  const stateMode = useState<EventModeType>("create");
  const stateEvent = useState(EVENT_EMPTY);

  const renderGuestNotAllowed = useMemo(
    () => <TemplatePageGuestNotAllowed />,
    []
  );

  const renderPage = useMemo(
    () => (
      <LayoutTemplateCard
        title="Create Event"
        leftButton={{
          icon: "arrow left",
          onClick: () => {
            router.back();
          },
        }}
        classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
      >
        <PageViewEventCard
          className="card ui"
          stateEvent={stateEvent}
          stateMode={stateMode}
          stateIdentification={stateIdentification}
          type={type}
          updateEvent={handleUpdateEvent}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
        />
      </LayoutTemplateCard>
    ),
    [
      handleUpdateEvent,
      router,
      stateEvent,
      stateIdentification,
      stateMode,
      type,
      updateUserSubscribedEventClientSide,
    ]
  );

  return isAuthorized ? renderPage : renderGuestNotAllowed;
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
