import { useCallback, useMemo } from "react";
import { Button, Checkbox } from "semantic-ui-react";
import clsx from "clsx";
import { EventButtonFilter, PageHomeCalendarDate } from "@/components";
import {
  EventTagNameType,
  EventType,
  FocusDateType,
  StateObject,
} from "@/types";
import { getDateMonthYear, strDay, strMonth } from "@/utils";
import { DAYS } from "@/consts";
import { useIdentification, useScreen } from "@/hooks";

export interface LayoutCalendarProps {
  stateShowHidden: StateObject<boolean>;
  stateFocusDate: StateObject<FocusDateType>;
  stateFilters: StateObject<EventTagNameType[]>;
  events: Record<number, EventType[]>;
}

export function LayoutCalendar({
  events,
  stateFocusDate,
  stateShowHidden,
  stateFilters,
}: LayoutCalendarProps) {
  const [focusDate, setFocusDate] = stateFocusDate;
  const { stateIdentification } = useIdentification();
  const { user } = stateIdentification[0];
  const { type } = useScreen();
  const [, setShowHidden] = stateShowHidden;

  const handleChangeTime = useCallback(
    (direction: number) => {
      setFocusDate((prev) => {
        const temp = new Date();
        temp.setDate(1);
        temp.setMonth(prev.month + direction);
        return getDateMonthYear(temp);
      });
    },
    [setFocusDate]
  );

  const calendar = useMemo(() => {
    const firstDateOfTheMonth = new Date(focusDate.year, focusDate.month, 1);
    const firstDateOnTheCalendar = new Date(focusDate.year, focusDate.month, 1);
    firstDateOnTheCalendar.setDate(
      firstDateOfTheMonth.getDate() - firstDateOfTheMonth.getDay()
    );
    const lastDateOnTheCalendar = new Date(
      firstDateOnTheCalendar.getFullYear(),
      firstDateOnTheCalendar.getMonth(),
      firstDateOnTheCalendar.getDate() - 1 + 6 * 7
    );

    const dateArr = [];
    for (
      let d = firstDateOnTheCalendar;
      d <= lastDateOnTheCalendar;
      d.setDate(d.getDate() + 1)
    ) {
      const currentDate = new Date(d);
      const calendarDate = {
        date: currentDate,
        events: [] as EventType[],
        differentMonth: currentDate.getMonth() !== focusDate.month,
      };
      if (currentDate.getMonth() === focusDate.month) {
        calendarDate.events.push(...events[currentDate.getDate()]);
      }
      dateArr.push(calendarDate);
    }

    return dateArr;
  }, [events, focusDate.month, focusDate.year]);

  const renderMonthControls = useMemo(
    () => (
      <div className="flex items-center gap-4">
        <Button
          basic
          circular
          icon={"chevron left"}
          onClick={() => handleChangeTime(-1)}
          size={type === "mobile" ? "tiny" : undefined}
        />
        <h1
          className={clsx(
            "text-secondary-7 w-40 text-center",
            type === "mobile" && "!w-24 !text-lg"
          )}
        >
          {strMonth(focusDate.month, 3)} {focusDate.year}
        </h1>
        <Button
          basic
          circular
          icon={"chevron right"}
          onClick={() => handleChangeTime(1)}
          size={type === "mobile" ? "tiny" : undefined}
        />
      </div>
    ),
    [focusDate.month, focusDate.year, handleChangeTime, type]
  );

  const renderHead = useMemo(
    () => (
      <div className="flex justify-between z-0">
        {renderMonthControls}
        <div className="flex gap-4">
          <EventButtonFilter stateFilters={stateFilters} />
        </div>
      </div>
    ),
    [renderMonthControls, stateFilters]
  );

  const renderLegend = useMemo(
    () => (
      <div
        className={clsx(
          "place-self-end",
          "flex items-center justify-center gap-2"
        )}
      >
        <b>EVENT COUNT</b>
        <span></span>
        {CALENDAR_LEGEND_MARKER_STYLE.map(({ color, text }, idx) => (
          <>
            <div
              key={`Legend_${idx}`}
              className={clsx(
                type === "mobile" ? "w-4 h-4 rounded-sm" : "w-8 h-8 rounded-lg",
                color
              )}
            />
            <span className={clsx(type === "mobile" ? "text-xs" : "text-base")}>
              {type === "mobile" ? text : `${text} Events`}
            </span>
          </>
        ))}
      </div>
    ),
    [type]
  );

  const renderCalendarFooter = useMemo(
    () => (
      <div className="flex flex-col gap-2">
        {user && user.role === "admin" && (
          <div className="flex items-center">
            <Checkbox
              onChange={(_, data) => setShowHidden(data.checked ?? false)}
              label={<label>Show hidden events ()</label>}
            />
          </div>
        )}
        {renderLegend}
      </div>
    ),
    [renderLegend, setShowHidden, user]
  );

  const renderCalendar = useMemo(() => {
    return (
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
                      focus={
                        calendar &&
                        calendar[7 * idx + idx2].date.getDate() ===
                          focusDate.day &&
                        calendar[7 * idx + idx2].date.getMonth() ===
                          focusDate.month
                      }
                      type={type}
                      onClick={() => {
                        if (calendar)
                          setFocusDate(
                            getDateMonthYear(calendar[7 * idx + idx2].date)
                          );
                      }}
                    />
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
        {renderCalendarFooter}
      </div>
    );
  }, [
    calendar,
    focusDate.day,
    focusDate.month,
    renderCalendarFooter,
    setFocusDate,
    type,
  ]);

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
  {
    color: "bg-emerald-200",
    text: "1-3",
  },
  {
    color: "bg-emerald-500",
    text: "4-6",
  },
  {
    color: "bg-emerald-700",
    text: ">6",
  },
];
