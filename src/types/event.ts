import { HTMLInputTypeAttribute, ReactNode } from "react";
import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export interface EventType {
  id: string;
  name: string;
  description: string;
  location?: string;
  authorId: string;
  postDate: number;
  organizer?: string;
  thumbnailSrc?: string;
  startDate: number;
  endDate?: number;
  followCount?: number;
  followerIds?: string[];
  guestFollowerCount?: number;
  tags: number[];
}

export interface EventDetailBaseType {
  icon: SemanticICONS;
  name: string;
  placeholder?: string;
}

export interface EventDetailSimpleTextType extends EventDetailBaseType {
  icon: SemanticICONS;
  name: string;
  rawValue: string | string[] | number | number[] | undefined;
  inputType: HTMLInputTypeAttribute;
}

export interface EventDetailComponentType extends EventDetailBaseType {
  icon: SemanticICONS;
  name: string;
  viewElement: ReactNode;
  editElement: ReactNode;
}

export type EventDetailType =
  | EventDetailSimpleTextType
  | EventDetailComponentType;

export type EventDetailUnionType = EventDetailSimpleTextType &
  EventDetailComponentType;

export interface EventTagType {
  name: string;
  color: SemanticCOLORS;
}

export type EventCardDisplayType = "horizontal" | "vertical";

export type EventThumbnailDisplayType =
  | "thumbnail-fixed-width"
  | "thumbnail-fixed-height"
  | "banner";

export interface EventModalTabType {
  name: string;
  onClick?: () => void;
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
