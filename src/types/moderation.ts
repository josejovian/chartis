export type ReportNameType = "event" | "comment" | "all";

export type ReportCategoryType =
  | "spam"
  | "misleading"
  | "fake"
  | "inappropriate"
  | "all";

export type ReportStatusType = "open" | "resolved" | "closed";

export interface ReportType {
  contentType: ReportNameType;
  contentId: string;
  authorId: string;
  reportedBy: string;
  category?: ReportCategoryType;
  date?: number;
  reason: string;
  status?: ReportStatusType;
  note?: string;
}

export interface ReportCategoryOptionType {
  name: string;
}

export type UserGroupFilterType = "admin" | "banned" | "user" | "all";

export type UserSortType = "oldest" | "newest" | "a-z" | "z-a";
