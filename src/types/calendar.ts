import { EventType } from "./event";

export interface CalendarDateType {
  date: Date;
  focus?: boolean;
  differentMonth?: boolean;
  events?: EventType[];
  eventCount?: number;
  followedCount?: number;
}

export interface FocusDateType {
  day: number;
  month: number;
  year: number;
  hour?: number;
  minute?: number;
  second?: number;
}
