import {
  DropdownOptionType,
  EventSortType,
  EventTagNameType,
  EventType,
  EventUpdateNameType,
} from "@/types";

export const EVENT_EMPTY: EventType = {
  id: "unset",
  authorId: "admin",
  authorName: "admin",
  name: "",
  description: "",
  organizer: "",
  location: "",
  postDate: 0,
  startDate: 0,
  tags: {},
  version: 0,
};

export const EVENT_DUMMY_1: EventType = {
  id: "0",
  authorId: "admin",
  authorName: "admin",
  name: "December Monthly Report Deadline",
  description: "Reminder pengumpulan laporan enrichment untuk bulan Desember.",
  postDate: 0,
  startDate: 0,
  endDate: 10,
  tags: {},
};

export const EVENT_DUMMY_2: EventType = {
  id: "1",
  authorId: "admin",
  authorName: "admin",
  name: "December Monthly Report Deadline",
  description: "Reminder pengumpulan laporan enrichment untuk bulan Desember.",
  postDate: 0,
  startDate: 0,
  endDate: 10,
  tags: {},
};

export const EVENT_TAGS: Record<EventTagNameType, DropdownOptionType> = {
  seminar: {
    name: "Seminar",
    color: "blue",
  },
  workshop: {
    name: "Workshop",
    color: "yellow",
  },
  briefing: {
    name: "Briefing",
    color: "red",
  },
  reminder: {
    name: "Reminder",
    color: "purple",
  },
  competition: {
    name: "Competition",
    color: "green",
  },
};

export const EVENT_SORT_CRITERIA: EventSortType[] = [
  { id: "oldest", key: "postDate", name: "Oldest", descending: false },
  { id: "latest", key: "postDate", name: "Latest", descending: true },
  {
    id: "leastFollowers",
    key: "subscriberCount",
    name: "Least Followers",
    descending: false,
  },
  {
    id: "mostFollowers",
    key: "subscriberCount",
    name: "Most Followers",
    descending: true,
  },
];

export const EVENT_QUERY_LENGTH_CONSTRAINTS = [3, 20]; //[min, max]

export const EVENT_UPDATE_TERM: Record<EventUpdateNameType, string> = {
  "update-description": "description",
  "update-end-date": "end date",
  "update-location": "location",
  "update-organizer": "organizer",
  "update-start-date": "start date",
  "update-tags": "tags",
  "update-title": "title",
  "initial-post": "post",
};
