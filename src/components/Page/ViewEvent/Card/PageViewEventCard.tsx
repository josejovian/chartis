import {
  LayoutCard,
  PageViewEventBody,
  PageViewEventFoot,
  PageViewEventHead,
} from "@/components";
import { EventType, ScreenSizeCategoryType, StateObject } from "@/types";

export interface ModalViewEventProps {
  className?: string;
  event: EventType;
  stateEdit: StateObject<boolean>;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCard({
  className,
  event,
  stateEdit,
  type,
}: ModalViewEventProps) {
  return (
    <LayoutCard className={className}>
      <PageViewEventHead event={event} type={type} stateEdit={stateEdit} />
      <PageViewEventBody event={event} type={type} />
      <PageViewEventFoot event={event} stateEdit={stateEdit} />
    </LayoutCard>
  );
}
