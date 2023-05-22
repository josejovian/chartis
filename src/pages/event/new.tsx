import { useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import {
  LayoutTemplateCard,
  PageViewEventCard,
  TemplatePageGuestNotAllowed,
} from "@/components";
import {
  useScreen,
  useIdentification,
  useAuthorization,
  useEventsObject,
} from "@/hooks";
import { EVENT_EMPTY } from "@/consts";
import { EventModeType, ResponsiveStyleType } from "@/types";

export default function CreateEvent() {
  const auth = getAuth();
  const router = useRouter();

  const { width, type } = useScreen();
  const { updateClientSideEvent, updateUserSubscribedEventClientSide } =
    useEventsObject();
  const { stateIdentification } = useIdentification();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "user",
  });

  const stateMode = useState<EventModeType>("create");
  const stateEvent = useState({
    ...EVENT_EMPTY,
    startDate: new Date().getTime(),
  });

  return (
    <LayoutTemplateCard
      title="Create Event"
      htmlTitle="Create Event"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
      minPermission="user"
      authorized={isAuthorized}
      unauthorizedElement={<TemplatePageGuestNotAllowed />}
    >
      <PageViewEventCard
        className="card ui"
        stateEvent={stateEvent}
        stateMode={stateMode}
        stateIdentification={stateIdentification}
        width={width}
        type={type}
        updateClientSideEvent={updateClientSideEvent}
        updateUserSubscribedEventClientSide={
          updateUserSubscribedEventClientSide
        }
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
