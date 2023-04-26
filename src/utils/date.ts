import { DAYS, MONTHS } from "@/consts";
import { FocusDateType } from "@/types";

export function getDateMonthYear(date: Date): FocusDateType {
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

export function parseFromDateMonthYear(date: FocusDateType): Date {
  const now = new Date();
  now.setDate(date.day);
  now.setMonth(date.month);
  now.setFullYear(date.year);
  return now;
}

export function strMonth(idx: number, length?: number) {
  return MONTHS[idx].slice(0, length);
}

export function strDay(idx: number, length?: number) {
  return DAYS[idx].slice(0, length);
}

export function strDate(date: Date) {
  return date.toLocaleDateString("en", { month: "short" });
}

export function strTime(date: Date) {
  return date.toLocaleString("en", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function strDateTime(date: Date) {
  return `${strDate(date)}, ${strTime(date)}`;
}

export function getTimeDifference(timeBefore: number, timeAfter?: number) {
  if (!timeBefore) return `unknown time`;

  if (!timeAfter) timeAfter = new Date().getTime();

  const string = (() => {
    const difference = Math.abs(Math.ceil((timeAfter - timeBefore) / 1000));

    if (difference < 60) {
      return `less than a minute`;
    } else if (difference < 60 * 60) {
      const timeBefore = Math.floor(difference / 60);
      return `${Math.floor(difference / 60)} minute${
        timeBefore > 1 ? "s" : ""
      }`;
    } else if (difference < 60 * 60 * 24) {
      const timeBefore = Math.floor(difference / (60 * 60));
      return `${Math.floor(difference / (60 * 60))} hour${
        timeBefore > 1 ? "s" : ""
      }`;
    } else if (difference < 60 * 60 * 24 * 7) {
      const timeBefore = Math.floor(difference / (60 * 60 * 24));
      return `${Math.floor(difference / (60 * 60 * 24))} day${
        timeBefore > 1 ? "s" : ""
      }`;
    } else if (difference < 60 * 60 * 24 * 7 * 30) {
      const timeBefore = Math.floor(difference / (60 * 60 * 24 * 7));
      return `${Math.floor(difference / (60 * 60 * 24 * 7))} week${
        timeBefore > 1 ? "s" : ""
      }`;
    } else if (difference < 60 * 60 * 24 * 7 * 30 * 12) {
      const timeBefore = Math.floor(difference / (60 * 60 * 24 * 7 * 30));
      return `${Math.floor(difference / (60 * 60 * 24 * 7 * 30))} month${
        timeBefore > 1 ? "s" : ""
      }`;
    } else {
      const timeBefore = Math.floor(difference / (60 * 60 * 24 * 7 * 30 * 12));
      return `${Math.floor(difference / (60 * 60 * 24 * 7 * 30 * 12))} year${
        timeBefore > 1 ? "s" : ""
      }`;
    }
  })();

  return timeAfter < timeBefore ? `in ${string}` : `${string} ago`;
}

export function getLocalTimeInISO(time: number) {
  const offset = new Date().getTimezoneOffset() * 60 * 1000;
  const result = new Date(time).getTime() - offset;
  return new Date(result).toISOString().substring(0, 16);
}
