import {
  EventSortDirectionType,
  EventSortType,
  EventTagNameType,
  EventTagType,
  EventType,
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
  tags: [],
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
  tags: ["reminder"],
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
  tags: ["reminder"],
};

export const EVENT_TAGS: Record<EventTagNameType, EventTagType> = {
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
  { id: "postDate", name: "Post Date" },
  { id: "subscriberCount", name: "Followers" },
];

export const EVENT_SORT_TYPE: EventSortDirectionType[] = [
  { value: false, name: "Ascending" },
  { value: true, name: "Descending" },
];

export const EVENT_QUERY_LENGTH_CONSTRAINTS = [3, 20]; //[min, max]
