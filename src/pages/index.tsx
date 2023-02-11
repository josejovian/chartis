import { useState } from "react";
import { LayoutSidebar, LayoutCalendar } from "@/components";

export default function Home() {
	const stateFocusDate = useState(new Date());
	const focusDate = stateFocusDate[0];

	return (
		<div className="flex flex-auto">
			<LayoutCalendar stateFocusDate={stateFocusDate} />
			<LayoutSidebar focusDate={focusDate} events={[]} />
		</div>
	);
}
