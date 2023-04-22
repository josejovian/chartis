import { EventUpdateBatchType } from "./event";
import { StateObject } from "./misc";

export interface NotificationType {
  id: string;
  type: string;
  eventId: string;
  commentId?: string;
  userId?: string;
}

export interface NotificationContextPropsType {
  stateUpdates: StateObject<EventUpdateBatchType[]>;
}
