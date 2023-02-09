import { Label } from "semantic-ui-react";
import { EventTagType } from "@/types";

export function EventTag({ name, color }: EventTagType) {
	return (
		<Label
			size="small"
			color={color}
			className="text-12px font-bold !uppercase"
		>
			{name}
		</Label>
	);
}
