import { useRouter } from "next/router";
import { LayoutTemplateCard, PageViewEventCard } from "@/components";
import { EVENT_EMPTY } from "@/consts";
import { useState } from "react";
import { useScreen, useEvent } from "@/hooks";
import { EventModeType, ResponsiveStyleType } from "@/types";

export default function Notification() {
  const router = useRouter();

  const { handleUpdateEvent } = useEvent({});
  const stateMode = useState<EventModeType>("create");
  const stateActiveTab = useState(0);
  const { type } = useScreen();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeTab = stateActiveTab[0];

  const stateEvent = useState(EVENT_EMPTY);

  return (
    <LayoutTemplateCard
      title="Notifications"
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
        type={type}
        updateEvent={handleUpdateEvent}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
