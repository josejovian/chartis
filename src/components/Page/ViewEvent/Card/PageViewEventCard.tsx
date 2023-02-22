import { useState } from "react";
import { PageViewEventBody, PageViewEventFoot, PageViewEventHead } from ".";
import { useScreen } from "@/hooks";
import { EventType } from "@/types";
import { LayoutCard } from "@/components/Layout";

export interface ModalViewEventProps {
  className?: string;
  event: EventType;
}

export function PageViewEventCard({ className, event }: ModalViewEventProps) {
  const stateEdit = useState(false);
  const stateActiveTab = useState(0);
  const { type } = useScreen();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const activeTab = stateActiveTab[0];

  return (
    <LayoutCard className={className}>
      <PageViewEventHead event={event} type={type} stateEdit={stateEdit} />
      <PageViewEventBody event={event} type={type} />
      <PageViewEventFoot event={event} stateEdit={stateEdit} />
    </LayoutCard>
  );
}
