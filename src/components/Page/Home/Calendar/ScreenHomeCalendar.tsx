import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Icon } from "semantic-ui-react";
import clsx from "clsx";
import { ScreenHomeCalendarDate, ScreenHomeCalendarFilter } from "@/components";
import { CalendarDateType, EventType, StateObject } from "@/types";
import { strDay, strMonth } from "@/utils";
import { DAYS } from "@/consts";

const CALENDAR_TABLE_HEADER_CELL_STYLE = clsx(
  "px-3 py-3 border-2 border-white bg-white",
  "text-16px !text-left uppercase"
);
const CALENDAR_LEGEND_MARKER_BASE_STYLE = "w-8 h-8 rounded-lg";
const CALENDAR_LEGEND_MARKER_STYLE = [
  "bg-emerald-100",
  "bg-emerald-300",
  "bg-emerald-500",
  "bg-emerald-700",
];

export interface LayoutCalendarProps {
  stateFocusDate: StateObject<Date>;
  stateFilters: StateObject<Record<number, boolean>>;
  visibleFilters: Record<number, boolean>;
  events: EventType[];
}

export function LayoutCalendar({
  stateFocusDate,
  stateFilters,
  visibleFilters,
  events,
}: LayoutCalendarProps) {
  const [focusDate, setFocusDate] = stateFocusDate;
  const [calendar, setCalendar] = useState<CalendarDateType[]>();
  const [countData, setCountData] = useState<number[]>([]);

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
      <div className="flex gap-4">
        <Button basic circular icon onClick={() => handleChangeTime(-1)}>
          <Icon name="chevron left" />
        </Button>
        <h1 className="text-secondary-7 w-40 text-center">
          {strMonth(focusDate.getMonth(), 3)} {focusDate.getFullYear()}
        </h1>
        <Button basic circular icon onClick={() => handleChangeTime(1)}>
          <Icon name="chevron right" />
        </Button>
      </div>
    ),
    [focusDate, handleChangeTime]
  );

  const renderFilterMenu = useMemo(
    () => (
      <ScreenHomeCalendarFilter
        stateFilters={stateFilters}
        visibleFilters={visibleFilters}
      />
    ),
    [stateFilters, visibleFilters]
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
        >
          Today
        </Button>
        {renderFilterMenu}
      </div>
    );
  }, [focusDate, handleChangeToToday, renderFilterMenu]);

  const renderHead = useMemo(
    () => (
      <div className="flex justify-between">
        {renderMonthControls}
        {renderMenu}
      </div>
    ),
    [renderMenu, renderMonthControls]
  );

  const renderCalendar = useMemo(
    () => (
      <table className="w-full h-full table-fixed">
        <thead>
          <tr className="h-12">
            {DAYS.map((day, idx) => (
              <th className={CALENDAR_TABLE_HEADER_CELL_STYLE} key={day}>
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
                    calendarDate={calendar && calendar[7 * idx + idx2]}
                    countData={countData}
                    onClick={() => {
                      if (calendar) setFocusDate(calendar[7 * idx + idx2].date);
                    }}
                  />
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    ),
    [calendar, countData, setFocusDate]
  );

  const renderLegend = useMemo(
    () => (
      <div
        className={clsx(
          "absolute bottom-8 right-24",
          "flex items-center justify-center gap-2"
        )}
      >
        <span>Less</span>
        {CALENDAR_LEGEND_MARKER_STYLE.map((MARKER_STYLE, idx) => (
          <div
            key={`Legend_${idx}`}
            className={clsx(CALENDAR_LEGEND_MARKER_BASE_STYLE, MARKER_STYLE)}
          />
        ))}
        <span>More</span>
      </div>
    ),
    []
  );

  useEffect(() => {
    handleBuildCalendar();
  }, [handleBuildCalendar]);

  return (
    <div className="relative flex flex-col w-full p-20 gap-16">
      {renderHead}
      {renderCalendar}
      {renderLegend}
    </div>
  );
}
