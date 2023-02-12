import { DAYS, MONTHS } from "@/consts";

export function strMonth(idx: number, length?: number) {
	return MONTHS[idx].slice(0, length);
}

export function strDay(idx: number, length?: number) {
	return DAYS[idx].slice(0, length);
}

export function strDate(date: Date) {
	return `${date.getDate()} ${strMonth(
		date.getMonth(),
		3
	)} ${date.getFullYear()}`;
}

export function strTime(date: Date) {
	const hour = date.getHours();
	const text = 24 > hour && hour >= 12 ? "PM" : "AM";
	const ampm = 24 > hour && hour > 12 ? hour - 12 : hour % 24;
	const minutes = date.getMinutes();

	return `${ampm}:${minutes >= 10 ? minutes : `0${minutes}`} ${text}`;
}

export function strDateTime(date: Date) {
	return `${strDate(date)}, ${strTime(date)}`;
}
