import { NotificationData } from "./update";
import { StateObject } from "./misc";

export interface NotificationType {
  id: string;
  type: string;
  eventId: string;
  commentId?: string;
  userId?: string;
}

export interface NotificationContextPropsType {
  stateNotification: StateObject<NotificationData[]>;
}
