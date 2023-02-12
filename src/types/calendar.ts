import { EventType } from "./event";

export interface CalendarDateType {
	date: Date;
	focus?: boolean;
	differentMonth?: boolean;
	events?: EventType[];
	eventCount?: number;
	followedCount?: number;
}
