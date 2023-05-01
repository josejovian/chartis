import {
  DropdownOptionType,
  DropdownSortOptionType,
  ReportCategoryOptionType,
  ReportCategoryType,
  ReportNameType,
  ReportType,
  UserGroupFilterType,
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

export const MODERATION_REPORT_CONTENT_TYPE: Record<
  ReportNameType,
  ReportCategoryOptionType
> = {
  all: {
    name: "All",
  },
  comment: {
    name: "Comment",
  },
  event: {
    name: "Event",
  },
};

export const MODERATION_REPORT_FILTER_CATEGORY: Record<
  ReportCategoryType,
  ReportCategoryOptionType
> = {
  ...{
    all: {
      name: "All",
    },
  },
  ...(MODERATION_REPORT_CATEGORY as Record<
    ReportCategoryType,
    ReportCategoryOptionType
  >),
};

export const MODERATION_REPORT_SORT: DropdownSortOptionType<ReportType>[] = [
  {
    id: "oldest",
    key: "date",
    name: "Oldest",
    descending: false,
  },
  {
    id: "newest",
    key: "date",
    name: "Newest",
    descending: true,
  },
];

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

export const MODERATION_USER_SORT: DropdownSortOptionType<UserType>[] = [
  {
    id: "oldest",
    key: "joinDate",
    name: "Join Date (Oldest)",
    descending: false,
  },
  {
    id: "newest",
    key: "joinDate",
    name: "Join Date (Newest)",
    descending: true,
  },
  {
    id: "a-z",
    key: "name",
    name: "Name (A to Z)",
    descending: false,
  },
  {
    id: "z-a",
    key: "name",
    name: "Name (Z to A)",
    descending: true,
  },
];
