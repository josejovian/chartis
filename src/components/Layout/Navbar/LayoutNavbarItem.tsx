import clsx from "clsx";
import { Icon, SemanticICONS } from "semantic-ui-react";

export interface LayoutNavbarItemProps {
	name: string;
	icon: SemanticICONS;
	onClick?: () => void;
	visible?: boolean;
	active?: boolean;
}

export function LayoutNavbarItem({
	name,
	icon,
	onClick,
	active,
}: LayoutNavbarItemProps) {
	return (
		<div
			className={clsx(
				"h-8",
				"flex items-center",
				active
					? [
							"text-primary-3 bg-slate-800 hover:bg-slate-700",
							"border-l border-l-4 border-primary-3",
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  ]
					: ["text-gray-50 hover:bg-slate-700", "cursor-pointer"]
			)}
			onClick={onClick}
		>
			<span className="ml-4">
				<Icon name={icon} />
			</span>
			<span className="ml-2">{name}</span>
		</div>
	);
}
