import { Icon } from "semantic-ui-react";
import { EventDetailCompactType } from "@/types";

export function EventCardDetail({ icon, value }: EventDetailCompactType) {
  return (
    <li className="flex gap-1">
      <Icon name={icon} />
      <span>{value}</span>
    </li>
  );
}
