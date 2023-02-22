import { SemanticSIZES } from "semantic-ui-react";
import { EventTag } from "@/components";
import { EVENT_TAGS } from "@/consts";

export interface EventTagsProps {
  id: string;
  tags: number[];
  type?: "ModalViewEvent" | "EventCardDetail";
  size?: SemanticSIZES;
}

export function EventTags({
  id,
  tags,
  type = "EventCardDetail",
  size,
}: EventTagsProps) {
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
