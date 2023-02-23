import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import clsx from "clsx";
import { PageHomeCalendarDate } from "@/components";
import { CalendarDateType, EventType, StateObject } from "@/types";
import { strDay, strMonth } from "@/utils";
import { DAYS } from "@/consts";
import { useScreen } from "@/hooks";

export interface LayoutCalendarProps {
  stateFocusDate: StateObject<Date>;
  events: EventType[];
}

export function LayoutCalendar({
  stateFocusDate,
  events,
}: LayoutCalendarProps) {
  const [focusDate, setFocusDate] = stateFocusDate;
  const [calendar, setCalendar] = useState<CalendarDateType[]>();
  const [countData, setCountData] = useState<number[]>([]);
  const { type } = useScreen();

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

  const handleBuildCalendar = useCallback(() => {
    const firstDay = new Date(focusDate.getTime());
    firstDay.setDate(1);

    const newCalendar: CalendarDateType[] = [];
    const date = new Date(firstDay.getTime());
    let i = firstDay.getDay();

    const counts = [];
    while (date.getMonth() === firstDay.getMonth()) {
      const current = new Date(date.getTime());
      const eventsToday = events.filter(
        (event) =>
          new Date(event.startDate).getDate() === date.getDate() &&
          new Date(event.startDate).getMonth() === date.getMonth()
      );

      counts.push(eventsToday.length);
      newCalendar[i] = {
        date: current,
        events: eventsToday,
        focus:
          date.getDate() === focusDate.getDate() &&
          date.getMonth() === focusDate.getMonth(),
      };
      i++;

      date.setDate(date.getDate() + 1);
    }

    counts.sort((a, b) => a - b);
    setCountData(counts);

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
  }, [events, focusDate]);

  const renderMonthControls = useMemo(
    () => (
      <div className="flex items-center gap-4">
        <Button
          basic
          circular
          icon
          onClick={() => handleChangeTime(-1)}
          size={type === "mobile" ? "tiny" : undefined}
        >
          <Icon name="chevron left" />
        </Button>
        <h1
          className={clsx(
            "text-secondary-7 w-40 text-center",
            type === "mobile" && "!w-20 !text-lg"
          )}
        >
          {strMonth(focusDate.getMonth(), 3)} {focusDate.getFullYear()}
        </h1>
        <Button
          basic
          circular
          icon
          onClick={() => handleChangeTime(1)}
          size={type === "mobile" ? "tiny" : undefined}
        >
          <Icon name="chevron right" />
        </Button>
      </div>
    ),
    [focusDate, handleChangeTime, type]
  );

  const renderMenu = useMemo(() => {
    const today = new Date();
    return (
      <div className="flex gap-4">
        <Button
          onClick={handleChangeToToday}
          disabled={
            focusDate &&
            today.getDate() === focusDate.getDate() &&
            today.getMonth() === focusDate.getMonth()
          }
          size={type === "mobile" ? "tiny" : undefined}
        >
          Today
        </Button>
      </div>
    );
  }, [focusDate, handleChangeToToday, type]);

  const renderHead = useMemo(
    () => (
      <div className="flex justify-between">
        {renderMonthControls}
        {renderMenu}
      </div>
    ),
    [renderMenu, renderMonthControls]
  );

  const renderLegend = useMemo(
    () => (
      <div
        className={clsx(
          "place-self-end",
          "flex items-center justify-center gap-2"
        )}
      >
        <span>Less</span>
        {CALENDAR_LEGEND_MARKER_STYLE.map((MARKER_STYLE, idx) => (
          <div
            key={`Legend_${idx}`}
            className={clsx(
              type === "mobile" ? "w-4 h-4 rounded-sm" : "w-8 h-8 rounded-lg",
              MARKER_STYLE
            )}
          />
        ))}
        <span>More</span>
      </div>
    ),
    [type]
  );

  const renderCalendar = useMemo(
    () => (
      <div className="flex flex-col flex-auto gap-4">
        <table className="w-full h-full table-fixed">
          <thead>
            <tr className={clsx(type !== "mobile" && "h-12")}>
              {DAYS.map((day, idx) => (
                <th
                  className={clsx(
                    "px-3 py-3 border-2 border-white bg-white",
                    "text-16px !text-left uppercase",
                    type === "mobile" && "!text-center !py-2"
                  )}
                  key={day}
                >
                  {strDay(idx, type === "mobile" ? 1 : 3)}
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
                    <PageHomeCalendarDate
                      key={`Calendar_${idx}_${idx2}`}
                      calendarDate={calendar && calendar[7 * idx + idx2]}
                      countData={countData}
                      type={type}
                      onClick={() => {
                        if (calendar)
                          setFocusDate(calendar[7 * idx + idx2].date);
                      }}
                    />
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {renderLegend}
      </div>
    ),
    [calendar, countData, renderLegend, setFocusDate, type]
  );

  useEffect(() => {
    handleBuildCalendar();
  }, [handleBuildCalendar]);

  return (
    <div
      className={clsx(
        "relative flex flex-col w-full py-8",
        type === "desktop_lg" ? "px-16" : "px-8",
        type === "mobile" ? "h-fit" : "h-full"
      )}
    >
      <div
        className={clsx(
          "relative flex flex-col",
          type === "mobile" ? "gap-8" : "gap-16 h-full"
        )}
      >
        {renderHead}
        {renderCalendar}
      </div>
    </div>
  );
}

const CALENDAR_LEGEND_MARKER_STYLE = [
  "bg-emerald-100",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-emerald-700",
];