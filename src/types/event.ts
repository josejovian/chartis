import { ReactNode } from "react";
import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export interface EventType {
  id: string;
  name: string;
  description: string;
  location?: string;
  authorId: string;
  postDate: number;
  organizer?: string;
  src?: string;
  startDate: number;
  endDate?: number;
  followerIds?: string[];
  guestFollowerCount?: number;
  tags: number[];
}

export interface EventDetailType {
  icon: SemanticICONS;
  name: string;
  value: ReactNode;
}

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
  id: string;
  name: string;
}
