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
