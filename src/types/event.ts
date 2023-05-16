import { HTMLInputTypeAttribute, ReactNode } from "react";
import type { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";
import { UserPermissionType } from "./auth";
import { StateObject } from "./misc";

export interface EventType {
  id: string;
  name: string;
  description: string;
  location?: string;
  authorId: string;
  authorName: string;
  postDate: number;
  editDate?: number;
  lastUpdatedAt?: number;
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
  hide?: boolean;
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
  | "reminder"
  | "other";

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
  icon: SemanticICONS;
  onClick?: () => void;
  count?: number;
  permission?: UserPermissionType;
}

export interface EventSortType {
  id: string;
  key: keyof EventType;
  name: string;
  descending: boolean;
}

export type EventSortNameType =
  | "oldest"
  | "newest"
  | "leastFollowers"
  | "mostFollowers";

export interface EventSortDirectionType {
  value: boolean;
  name: string;
}

export type EventModeType = "create" | "edit" | "view";

export type EventSearchType =
  | "default"
  | "userFollowedEvents"
  | "userCreatedEvents"
  | "userFollowedTags";

export type EventCardTabNameType =
  | "detail"
  | "updates"
  | "discussion"
  | "reports";

export type EventsContextPropsType = {
  stateEventsObject: StateObject<Record<string, EventType>>;
  stateSubscribedIds: StateObject<Record<string, number>>;
};
