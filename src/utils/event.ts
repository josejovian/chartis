import { EventType } from "@/types";

export function filterEventsFromTags(
	events: EventType[],
	filters: Record<number, boolean>
) {
	return events.filter((event) =>
		event.tags.some((tag) =>
			Object.entries(filters).some(
				([key, value]) => value && Number(key) === tag
			)
		)
	);
}
