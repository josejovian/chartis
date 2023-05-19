import { DAYS, MONTHS, YEAR_MAX, YEAR_MIN } from "@/consts";
import { FocusDateType } from "@/types";

export function getCalendarVariables(date: FocusDateType) {
  const firstDateOfTheMonth = new Date(date.year, date.month, 1);
  const firstDateOnTheCalendar = new Date(date.year, date.month, 1);
  firstDateOnTheCalendar.setDate(
    firstDateOfTheMonth.getDate() - firstDateOfTheMonth.getDay()
  );
  const lastDateOfTheMonth = new Date(date.year, date.month, 1);
  lastDateOfTheMonth.setMonth(lastDateOfTheMonth.getMonth() + 1);
  lastDateOfTheMonth.setDate(0);
  const lastDateOnTheCalendar = new Date(
    firstDateOnTheCalendar.getFullYear(),
    firstDateOnTheCalendar.getMonth(),
    firstDateOnTheCalendar.getDate() - 1 + 6 * 7
  );
  const offsetDay = firstDateOfTheMonth.getDay();

  return {
    firstDateOfTheMonth,
    firstDateOnTheCalendar,
    lastDateOfTheMonth,
    lastDateOnTheCalendar,
    offsetDay,
  };
}

export function calculateEarliestTenYears(year: number, cursor: number) {
  return Math.floor(year / 10) * 10 + 10 * cursor;
}

export function safeIncrementYear(year: number, increment: number) {
  let currentYear = year + increment;
  if (currentYear < YEAR_MIN) currentYear = YEAR_MIN;
  if (currentYear > YEAR_MAX) currentYear = YEAR_MAX;
  return currentYear;
}

export function dateIsSafe(date: Date) {
  const year = date.getFullYear();

  return year >= YEAR_MIN && year < YEAR_MAX;
}

export function getSafeDate(date: Date) {
  const year = date.getFullYear();

  if (year < YEAR_MIN) {
    date.setFullYear(YEAR_MIN);
    date.setDate(1);
    date.setMonth(1);
  }

  if (YEAR_MAX <= year) {
    date.setFullYear(YEAR_MAX - 1);
    date.setDate(31);
    date.setMonth(12);
  }

  return date;
}

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
  return date.toLocaleString("en-gb", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
