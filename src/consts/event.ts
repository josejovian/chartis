import { EventTagType, EventType } from "@/types";

export const EVENT_DUMMY_1: EventType = {
	id: "0",
	authorId: "admin",
	name: "December Monthly Report Deadline",
	description:
		"Reminder pengumpulan laporan enrichment untuk bulan Desember.",
	startDate: 0,
	endDate: 10,
	tags: [3],
};

export const EVENT_DUMMY_2: EventType = {
	id: "1",
	authorId: "admin",
	name: "December Monthly Report Deadline",
	description:
		"Reminder pengumpulan laporan enrichment untuk bulan Desember.",
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
