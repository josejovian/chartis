import { useState } from "react";
import clsx from "clsx";
import { PageViewEventBody, PageViewEventFoot, PageViewEventHead } from ".";
import { useScreen } from "@/hooks";
import { EventType, ResponsiveStyleType } from "@/types";

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
        "card ui flex flex-col bg-white min-w-full",
        type !== "mobile" && "rounded-lg",
        VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE
      )}
    >
      <PageViewEventHead event={event} type={type} stateEdit={stateEdit} />
      <PageViewEventBody event={event} type={type} />
      <PageViewEventFoot event={event} stateEdit={stateEdit} />
    </div>
  );
}

const VIEW_EVENT_CARD_WRAPPER_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!mx-80",
  desktop_sm: "!mx-10",
  mobile: "",
};
