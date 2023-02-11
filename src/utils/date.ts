import { DAYS, MONTHS } from "@/consts";

export function strMonth(idx: number, length?: number) {
	return MONTHS[idx].slice(0, length);
}

export function strDay(idx: number, length?: number) {
	return DAYS[idx].slice(0, length);
}
