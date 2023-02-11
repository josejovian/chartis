import { CSSProperties, useMemo } from "react";
import clsx from "clsx";
import { strMonth } from "@/utils";
import { CalendarDateType } from "@/types";

const CALENDAR_CELL_BASE_STYLE = clsx(
	"px-3 py-3",
	"border-2 border-secondary-2 align-top",
	"hover:bg-gray-50 cursor-pointer"
);
const CALENDAR_CELL_DATE_STYLE =
	"text-16px uppercase text-center justify-center";
const CALENDAR_CELL_DATE_INLINE_STYLE: Partial<CSSProperties> = {
	width: "20px",
	display: "flex",
	textAlign: "center",
};
const CALENDAR_CELL_DATE_CURRENT_MONTH_STYLE = clsx(
	CALENDAR_CELL_DATE_STYLE,
	"text-16px uppercase"
);
const CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE = clsx(
	CALENDAR_CELL_DATE_STYLE,
	"text-secondary-4"
);
const CALENDAR_CELL_FOCUS = "bg-amber-400 font-bold text-white";
const CALENDAR_CELL_CURRENT_MONTH_WRAPPER = "w-fit p-2 -m-2 rounded-full";

export interface ScreenHomeCalendarDateProps {
	calendarDate?: CalendarDateType;
	onClick: () => void;
}

export function ScreenHomeCalendarDate({
	calendarDate,
	onClick,
}: ScreenHomeCalendarDateProps) {
	const month = calendarDate && calendarDate.date.getMonth();
	const date = calendarDate && calendarDate.date.getDate();
	const focus = calendarDate && calendarDate.focus;

	const renderDate = useMemo(() => {
		if (calendarDate && calendarDate.differentMonth)
			return (
				<div className="flex">
					<div className="flex justify-items-center">
						<span
							className={CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE}
							style={CALENDAR_CELL_DATE_INLINE_STYLE}
						>
							{date}
						</span>
					</div>
					<span
						className={clsx(
							CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE,
							date && date >= 10 && "ml-1"
						)}
					>
						{month !== undefined && strMonth(month, 3)}
					</span>
				</div>
			);

		return (
			<div
				className={clsx(
					"flex justify-items-center",
					CALENDAR_CELL_CURRENT_MONTH_WRAPPER,
					focus && CALENDAR_CELL_FOCUS
				)}
			>
				<span
					className={CALENDAR_CELL_DATE_CURRENT_MONTH_STYLE}
					style={CALENDAR_CELL_DATE_INLINE_STYLE}
				>
					{date}
				</span>
			</div>
		);
	}, [calendarDate, date, focus, month]);

	return (
		<td className={CALENDAR_CELL_BASE_STYLE} onClick={onClick}>
			{renderDate}
		</td>
	);
}
