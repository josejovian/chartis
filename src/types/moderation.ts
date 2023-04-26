export type ReportNameType = "event" | "comment";

export type ReportCategoryType =
  | "spam"
  | "misleading"
  | "fake"
  | "inappropriate";

export interface ReportType {
  contentType: ReportNameType;
  contentId: string;
  reportedBy: string;
  category?: ReportCategoryType;
  date?: number;
  reason: string;
}

export interface ReportCategoryOptionType {
  name: string;
}
