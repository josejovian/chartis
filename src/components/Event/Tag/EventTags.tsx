import { EVENT_TAGS } from "@/consts";
import { EventType } from "@/types";
import { SemanticSIZES } from "semantic-ui-react";
import { EventTag } from "./EventTag";

export interface EventTagsProps {
  event: EventType;
  type?: "ModalViewEvent" | "EventCardDetail";
  size?: SemanticSIZES;
}

export function EventTags({
  event,
  type = "EventCardDetail",
  size,
}: EventTagsProps) {
  const { id, tags = [] } = event;
  return (
    <>
      {tags.map((tag) => (
        <EventTag
          key={`${type}_${id}_${tag}`}
          size={size}
          {...EVENT_TAGS[tag]}
        />
      ))}
    </>
  );
}
