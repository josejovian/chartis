import {
  DropdownOptionType,
  DropdownSortOptionType,
  EventSortNameType,
  EventTagNameType,
  EventType,
  UpdateNameType,
} from "@/types";

export const EVENT_EMPTY: EventType = {
  id: "unset",
  authorId: "unset",
  name: "",
  description: "",
  organizer: "",
  location: "",
  postDate: 0,
  startDate: 0,
  tags: {},
  version: 0,
  thumbnailSrc: null,
  guestSubscriberCount: 0,
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
  other: {
    name: "Other",
    color: "grey",
  },
};

export const EVENT_SORT_CRITERIA: Record<
  EventSortNameType,
  DropdownSortOptionType<EventType>
> = {
  oldest: { key: "postDate", name: "Oldest", descending: false },
  newest: { key: "postDate", name: "Newest", descending: true },
  leastFollowers: {
    key: "subscriberCount",
    name: "Least Followers",
    descending: false,
  },
  mostFollowers: {
    key: "subscriberCount",
    name: "Most Followers",
    descending: true,
  },
};

export const EVENT_QUERY_LENGTH_CONSTRAINTS = [2, 20]; //[min, max]

export const EVENT_UPDATE_TERM: Record<UpdateNameType, string> = {
  "update-description": "description",
  "update-end-date": "end date",
  "update-location": "location",
  "update-organizer": "organizer",
  "update-start-date": "start date",
  "update-tags": "tags",
  "update-title": "title",
  "initial-post": "post",
  "update-thumbnail": "thumbnail",
};
