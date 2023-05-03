import {
  DropdownOptionType,
  DropdownSortOptionType,
  ReportCategoryFilterType,
  ReportCategoryOptionType,
  ReportCategoryType,
  ReportNameFilterType,
  ReportNameType,
  ReportSortType,
  ReportStatusFilterType,
  ReportType,
  UserGroupFilterType,
  UserSortType,
  UserType,
} from "@/types";

export const MODERATION_REPORT_CATEGORY: Omit<
  Record<ReportCategoryType, ReportCategoryOptionType>,
  "all"
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

export const MODERATION_REPORT_CATEGORY_FILTER: Record<
  ReportCategoryFilterType,
  ReportCategoryOptionType
> = {
  all: {
    name: "All",
  },
  ...MODERATION_REPORT_CATEGORY,
};

export const MODERATION_REPORT_CONTENT_TYPE: Record<
  ReportNameType,
  ReportCategoryOptionType
> = {
  comment: {
    name: "Comment",
  },
  event: {
    name: "Event",
  },
};

export const MODERATION_REPORT_CONTENT_TYPE_FILTER: Record<
  ReportNameFilterType,
  ReportCategoryOptionType
> = {
  all: {
    name: "All",
  },
  ...MODERATION_REPORT_CONTENT_TYPE,
};

export const MODERATION_REPORT_SORT: Record<
  ReportSortType,
  DropdownSortOptionType<ReportType>
> = {
  oldest: {
    key: "date",
    name: "Oldest",
    descending: false,
  },
  newest: {
    key: "date",
    name: "Newest",
    descending: true,
  },
};

export const MODERATION_USER_TYPE_FILTERS: Record<
  UserGroupFilterType,
  DropdownOptionType
> = {
  all: {
    name: "All Users",
  },
  user: {
    name: "Users",
  },
  banned: {
    name: "Banned Users",
  },
  admin: {
    name: "Admins",
  },
};

export const MODERATION_USER_SORT: Record<
  UserSortType,
  DropdownSortOptionType<UserType>
> = {
  oldest: {
    key: "joinDate",
    name: "Join Date (Oldest)",
    descending: false,
  },
  newest: {
    key: "joinDate",
    name: "Join Date (Newest)",
    descending: true,
  },
  "a-z": {
    key: "name",
    name: "Name (A to Z)",
    descending: false,
  },
  "z-a": {
    key: "name",
    name: "Name (Z to A)",
    descending: true,
  },
};

export const MODERATION_REPORT_STATUS_FILTER_TYPE: Record<
  ReportStatusFilterType,
  ReportCategoryOptionType
> = {
  all: {
    name: "All",
  },
  open: {
    name: "Open",
  },
  resolved: {
    name: "Resolved",
  },
};
