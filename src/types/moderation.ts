import { EventType } from "./event";

export type ReportNameType = "event" | "comment";

export type ReportNameFilterType = ReportNameType | "all";

export type ReportCategoryType =
  | "spam"
  | "misleading"
  | "fake"
  | "inappropriate";

export type ReportCategoryFilterType = ReportCategoryType | "all";

export type ReportStatusType = "open" | "resolved";

export type ReportStatusFilterType = ReportStatusType | "all";

export interface CommentReportType {
  contentType: "comment";
  commentId: string;
}

export interface EventReportType {
  contentType: "event";
}

export interface ReportBaseType {
  id?: string;
  eventId: string;
  authorId: string;
  reportedBy: string;
  category?: ReportCategoryType;
  date?: number;
  reason: string;
  status?: ReportStatusType;
}

export type ReportType = ReportBaseType & (EventReportType | CommentReportType);

export interface CommentReportExtendedType extends ReportBaseType {
  contentType: "comment";
  content: string;
}

export interface EventReportExtendedType extends ReportBaseType {
  contentType: "event";
  content: EventType;
}

export type ReportExtendedType =
  | CommentReportExtendedType
  | EventReportExtendedType;

export interface ReportCategoryOptionType {
  name: string;
}

export type UserGroupFilterType = "admin" | "banned" | "user" | "all";

export type UserSortType = "oldest" | "newest" | "a-z" | "z-a";
