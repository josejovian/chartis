export type UpdateNameType =
  | "update-description"
  | "update-start-date"
  | "update-end-date"
  | "update-title"
  | "update-tags"
  | "update-location"
  | "update-organizer"
  | "update-thumbnail"
  | "initial-post";

export type DatabaseUpdateChangesType = {
  eventId: string;
  updates: UpdateVersion[];
};

export type UpdateVersion = {
  date: number;
  authorId: string;
  updateId: string;
  updates: UpdateChangesType;
};

export type UpdateChangesType = Partial<
  Record<UpdateNameType, UpdateChangedValueType>
>;

export interface UpdateChangedValueType {
  valuePrevious?: string;
  valueNew?: string;
}

export interface EventUpdateBatchType {
  eventId: string;
  lastSeenVersion: number;
  unseen: boolean;
}

export interface EventUpdateArrayType {
  eventId: string;
  updates: EventUpdateBatchType[];
}

export type NotificationData = {
  eventId: string;
  eventVersion: number;
  authorId: string;
  eventName: string;
  lastUpdatedAt: number;
  changes: UpdateChangesType;
};
