import {
  EventSortDirectionType,
  EventSortType,
  EventTagType,
  EventType,
} from "@/types";

export const EVENT_EMPTY: EventType = {
  id: "unset",
  authorId: "admin",
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
  name: "December Monthly Report Deadline",
  description: "Reminder pengumpulan laporan enrichment untuk bulan Desember.",
  postDate: 0,
  startDate: 0,
  endDate: 10,
  tags: [3],
};

export const EVENT_DUMMY_2: EventType = {
  id: "1",
  authorId: "admin",
  name: "December Monthly Report Deadline",
  description: "Reminder pengumpulan laporan enrichment untuk bulan Desember.",
  postDate: 0,
  startDate: 0,
  endDate: 10,
  tags: [3],
};

export const EVENT_TAGS: EventTagType[] = [
  {
    name: "Seminar",
    color: "blue",
  },
  {
    name: "Workshop",
    color: "yellow",
  },
  {
    name: "Briefing",
    color: "red",
  },
  {
    name: "Reminder",
    color: "purple",
  },
  {
    name: "Competition",
    color: "green",
  },
];

export const EVENT_SORT_CRITERIA: EventSortType[] = [
  { id: "postDate", name: "Post Date" },
  { id: "followCount", name: "Followers" },
];

export const EVENT_SORT_TYPE: EventSortDirectionType[] = [
  { value: false, name: "Ascending" },
  { value: true, name: "Descending" },
];

export const EVENT_QUERY_LENGTH_CONSTRAINTS = [3, 20]; //[min, max]
