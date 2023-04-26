import { ReportCategoryOptionType, ReportCategoryType } from "@/types";

export const REPORT_CATEGORY: Record<
  ReportCategoryType,
  ReportCategoryOptionType
> = {
  fake: {
    name: "Fake",
  },
  inappropriate: {
    name: "Inappropriate",
  },
  misleading: {
    name: "Misleading",
  },
  spam: {
    name: "Spam",
  },
};
