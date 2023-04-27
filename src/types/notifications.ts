import { DatabaseUpdateChangesType } from "./update";
import { StateObject } from "./misc";

export interface NotificationType {
  id: string;
  type: string;
  eventId: string;
  commentId?: string;
  userId?: string;
}

export interface NotificationContextPropsType {
  stateUpdates: StateObject<DatabaseUpdateChangesType[]>;
}
