import { HTMLInputTypeAttribute, ReactNode } from "react";
import type { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export interface EventType {
  id: string;
  name: string;
  description: string;
  location?: string;
  authorId: string;
  authorName: string;
  postDate: number;
  editDate?: number;
  organizer?: string;
  thumbnailSrc?: string;
  startDate: number;
  endDate?: number;
  subscriberCount?: number;
  subscriberIds?: string[];
  guestSubscriberCount?: number;
  version?: number;
  commentCount?: number;
  tags: EventTagObjectType;
}

export interface EventDetailBaseType {
  icon: SemanticICONS;
  id: string;
  name: string;
  placeholder?: string;
  validate?: (value: unknown) => string | null;
}

export interface EventDetailSimpleTextType extends EventDetailBaseType {
  rawValue: string | string[] | number | number[] | undefined;
  moddedValue?: string | string[] | number | number[] | undefined;
  inputType: HTMLInputTypeAttribute;
}

export interface EventDetailCompactType extends EventDetailBaseType {
  value: string;
}

export interface EventDetailComponentType extends EventDetailBaseType {
  viewElement: ReactNode;
  editElement: ReactNode;
}

export type EventDetailType =
  | EventDetailSimpleTextType
  | EventDetailComponentType
  | EventDetailCompactType;

export type EventDetailUnionType = EventDetailSimpleTextType &
  EventDetailComponentType;

export type EventTagNameType =
  | "seminar"
  | "workshop"
  | "briefing"
  | "competition"
  | "reminder";

export interface EventTagType {
  name: string;
  color: SemanticCOLORS;
}

export type EventTagObjectType = Partial<Record<EventTagNameType, boolean>>;

export type EventCardDisplayType = "horizontal" | "vertical";

export type EventThumbnailDisplayType =
  | "thumbnail-fixed-width"
  | "thumbnail-fixed-height"
  | "banner";

export interface EventCardTabType {
  id: EventCardTabNameType;
  name: string;
  onClick?: () => void;
  count?: number;
}

export interface EventSortType {
  id: keyof EventType;
  name: string;
}

export interface EventSortDirectionType {
  value: boolean;
  name: string;
}

export type EventModeType = "create" | "edit" | "view";

export type EventSearchType =
  | "userFollowedEvents"
  | "userCreatedEvents"
  | "userFollowedTags";

export type EventCardTabNameType =
  | "detail"
  | "updates"
  | "discussion"
  | "reports";

export type EventUpdateNameType =
  | "update-description"
  | "update-start-date"
  | "update-end-date"
  | "update-title"
  | "update-tags"
  | "update-location"
  | "update-organizer"
  | "initial-post";

export interface EventUpdateType {
  valuePrevious?: string;
  valueNew?: string;
}

export interface EventUpdateBatchDatabaseType {
  updateId: string;
  updates: Partial<Record<EventUpdateNameType, EventUpdateType>>;
  authorId: string;
  date: number;
}

export interface EventUpdateBatchType extends EventUpdateBatchDatabaseType {
  eventId: string;
  version: number;
}

export interface EventUpdateArrayType {
  updates: EventUpdateBatchType[];
}
