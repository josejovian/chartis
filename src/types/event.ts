import { SemanticCOLORS, SemanticICONS } from "semantic-ui-react";

export interface EventType {
	id: string;
	name: string;
	description: string;
	authorId: string;
	organizer?: string;
	src?: string;
	startDate: number;
	endDate?: number;
	followerIds?: string[];
	guestFollowerCount?: number;
	tags: number[];
}

export interface EventExtraDetailType {
	icon: SemanticICONS;
	name: string;
	value: string;
}

export interface EventTagType {
	name: string;
	color: SemanticCOLORS;
}

export type EventCardDisplayType = "horizontal" | "vertical";

export type EventThumbnailDisplayType =
	| "thumbnail-fixed-width"
	| "thumbnail-fixed-height"
	| "banner";
