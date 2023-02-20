import { useState } from "react";
import clsx from "clsx";
import { PageViewEventBody, PageViewEventFoot, PageViewEventHead } from ".";
import { useScreen } from "@/hooks";
import { EventType, ResponsiveInlineStyleType } from "@/types";

export interface ModalViewEventProps {
  event: EventType;
}

export function PageViewEventCard({ event }: ModalViewEventProps) {
  const stateEdit = useState(false);
  const stateActiveTab = useState(0);
  const { type } = useScreen();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeTab = stateActiveTab[0];

  return (
    <div
      className={clsx(
        "card ui flex flex-col bg-white",
        type !== "mobile" && "rounded-lg"
      )}
      style={VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_INLINE_STYLE[type]}
    >
      <PageViewEventHead event={event} stateEdit={stateEdit} />
      <PageViewEventBody event={event} type={type} />
      <PageViewEventFoot event={event} stateEdit={stateEdit} />
    </div>
  );
}

const VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_INLINE_STYLE: ResponsiveInlineStyleType =
  {
    desktop_lg: {
      width: "1024px",
    },
    desktop_sm: {
      width: "800px",
    },
    mobile: {
      width: "100%",
    },
  };
