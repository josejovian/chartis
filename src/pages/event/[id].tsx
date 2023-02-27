/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "next/router";
import { LayoutTemplateCard, PageViewEventCard } from "@/components";
import { EVENT_DUMMY_1 } from "@/consts";
import { useState } from "react";
import { useScreen } from "@/hooks";
import { EventModeType, ResponsiveStyleType } from "@/types";

export default function ViewEvent() {
  const router = useRouter();
  const { id } = router.query;

  const stateMode = useState<EventModeType>("view");
  const stateActiveTab = useState(0);
  const { type } = useScreen();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeTab = stateActiveTab[0];

  const event = EVENT_DUMMY_1;

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
      <PageViewEventCard
        className="card ui"
        event={event}
        stateMode={stateMode}
        type={type}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
