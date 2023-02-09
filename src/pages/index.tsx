import { EventCard } from "@/components";
import { EVENT_DUMMY_1 } from "@/consts/event";

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center w-full gap-8">
			<EventCard event={EVENT_DUMMY_1} />
		</div>
	);
}
