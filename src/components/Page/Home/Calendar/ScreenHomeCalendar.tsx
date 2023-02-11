import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Button, Icon } from "semantic-ui-react";
import { ScreenHomeCalendarDate } from "@/components";
import { CalendarDateType, StateObject } from "@/types";
import { strDay, strMonth } from "@/utils";
import { DAYS } from "@/consts";

const CALENDAR_CELL_BASE_STYLE = "px-3 py-3 border-2 border-secondary-2";
const CALENDAR_TABLE_STYLE = "w-full h-full table-fixed";
const CALENDAR_TABLE_HEADER_ROW_STYLE = "h-12";
const CALENDAR_TABLE_HEADER_CELL_STYLE = "text-16px !text-left uppercase";

export interface LayoutCalendarProps {
	stateFocusDate: StateObject<Date>;
}

export function LayoutCalendar({ stateFocusDate }: LayoutCalendarProps) {
	const [focusDate, setFocusDate] = stateFocusDate;
	const [calendar, setCalendar] = useState<CalendarDateType[]>();

	const handleChangeTime = useCallback(
		(direction: number) => {
			setFocusDate((prev) => {
				const temp = new Date(prev.getTime());
				temp.setDate(1);
				temp.setMonth(temp.getMonth() + direction);
				return temp;
			});
		},
		[setFocusDate]
	);

	const handleChangeToToday = useCallback(
		() => setFocusDate(new Date()),
		[setFocusDate]
	);

	const renderMonth = useMemo(
		() => (
			<div className="flex gap-4">
				<Button
					basic
					circular
					icon
					onClick={() => handleChangeTime(-1)}
				>
					<Icon name="chevron left" />
				</Button>
				<h1 className="text-secondary-7 w-40 text-center">
					{strMonth(focusDate.getMonth(), 3)}{" "}
					{focusDate.getFullYear()}
				</h1>
				<Button basic circular icon onClick={() => handleChangeTime(1)}>
					<Icon name="chevron right" />
				</Button>
			</div>
		),
		[focusDate, handleChangeTime]
	);

	const renderMenu = useMemo(() => {
		const today = new Date();
		console.log("Today: ", today);
		console.log("Focus: ", focusDate);
		return (
			<div className="flex gap-4">
				<Button
					onClick={handleChangeToToday}
					disabled={
						focusDate &&
						today.getDate() === focusDate.getDate() &&
						today.getMonth() === focusDate.getMonth()
					}
				>
					Today
				</Button>
				<Button>Month</Button>
				<Button>Filter</Button>
			</div>
		);
	}, [focusDate, handleChangeToToday]);

	const renderTopMenu = useMemo(
		() => (
			<div className="flex justify-between">
				{renderMonth}
				{renderMenu}
			</div>
		),
		[renderMenu, renderMonth]
	);

	const renderCalendar = useMemo(
		() => (
			<table className={CALENDAR_TABLE_STYLE}>
				<thead>
					<tr className={CALENDAR_TABLE_HEADER_ROW_STYLE}>
						{DAYS.map((day, idx) => (
							<th
								className={clsx(
									CALENDAR_CELL_BASE_STYLE,
									CALENDAR_TABLE_HEADER_CELL_STYLE
								)}
								key={day}
							>
								{strDay(idx, 3)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array(6)
						.fill(0)
						.map((_, idx) => (
							<tr key={`Calendar_${idx}`}>
								{DAYS.map((_, idx2) => (
									<ScreenHomeCalendarDate
										key={`Calendar_${idx}_${idx2}`}
										calendarDate={
											calendar && calendar[7 * idx + idx2]
										}
										onClick={() => {
											if (calendar)
												setFocusDate(
													calendar[7 * idx + idx2]
														.date
												);
										}}
									/>
								))}
							</tr>
						))}
				</tbody>
			</table>
		),
		[calendar, setFocusDate]
	);

	const handleBuildCalendar = useCallback(() => {
		const firstDay = new Date(focusDate.getTime());
		firstDay.setDate(1);

		const newCalendar: CalendarDateType[] = [];
		const date = new Date(firstDay.getTime());
		let i = firstDay.getDay();

		while (date.getMonth() === firstDay.getMonth()) {
			newCalendar[i] = {
				date: new Date(date.getTime()),
				focus:
					date.getDate() === focusDate.getDate() &&
					date.getMonth() === focusDate.getMonth(),
			};
			i++;
			date.setDate(date.getDate() + 1);
		}

		const firstDifference = firstDay.getDay();

		const pastDate = new Date(firstDay.getTime());
		for (i = 1; i <= firstDifference; i++) {
			pastDate.setDate(pastDate.getDate() - 1);
			newCalendar[firstDifference - i] = {
				date: new Date(pastDate.getTime()),
				differentMonth: true,
			};
		}

		const secondDifference = 7 * 6 - newCalendar.length;
		for (i = 1; i <= secondDifference; i++) {
			newCalendar.push({
				date: new Date(date.getTime()),
				differentMonth: true,
			});
			date.setDate(date.getDate() + 1);
		}

		setCalendar(newCalendar);
	}, [focusDate]);

	useEffect(() => {
		handleBuildCalendar();
	}, [handleBuildCalendar]);

	return (
		<div className="flex flex-col w-full p-20 gap-16">
			{renderTopMenu}
			{renderCalendar}
		</div>
	);
}
