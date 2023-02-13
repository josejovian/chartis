import { EventExtraDetailType } from "@/types";
import { Icon } from "semantic-ui-react";

export function EventCardDetail({ icon, value }: EventExtraDetailType) {
  return (
    <li>
      <Icon name={icon} />
      <span>{value}</span>
    </li>
  );
}
