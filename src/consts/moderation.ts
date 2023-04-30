import {
  DropdownOptionType,
  DropdownSortOptionType,
  ReportCategoryOptionType,
  ReportCategoryType,
  UserGroupFilterType,
  UserType,
} from "@/types";

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
