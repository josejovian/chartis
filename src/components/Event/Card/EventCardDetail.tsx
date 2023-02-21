import { Icon } from "semantic-ui-react";
import { EventDetailType } from "@/types";

export function EventCardDetail({ icon, value }: EventDetailType) {
  return (
    <li className="flex gap-1">
      <Icon name={icon} />
      <span>{value}</span>
    </li>
  );
}
