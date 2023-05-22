import { useCallback, useMemo } from "react";
import { Button, Checkbox } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventButtonFilter,
  ModalDateTimePick,
  PageHomeCalendarDate,
} from "@/components";
import {
  EventTagNameType,
  EventType,
  FocusDateType,
  StateObject,
} from "@/types";
import {
  dateIsSafe,
  getCalendarVariables,
  getDateMonthYear,
  safeIncrementYear,
  strDay,
  strMonth,
} from "@/utils";
import { DAYS, YEAR_MAX, YEAR_MIN } from "@/consts";
import { useIdentification, useModal, useScreen } from "@/hooks";

export interface LayoutCalendarProps {
  stateShowHidden: StateObject<boolean>;
  stateFocusDate: StateObject<FocusDateType>;
  stateFilters: StateObject<EventTagNameType[]>;
  events: Record<number, EventType[]>;
  hiddenCount?: number;
}

export function LayoutCalendar({
  events,
  stateFocusDate,
  stateShowHidden,
  stateFilters,
  hiddenCount,
}: LayoutCalendarProps) {
  const [focusDate, setFocusDate] = stateFocusDate;
  const { stateIdentification } = useIdentification();
  const { user } = stateIdentification[0];
  const { type } = useScreen();
  const [, setShowHidden] = stateShowHidden;
  const { setModal } = useModal();

  const handleChangeTime = useCallback(
    (direction: number) => {
      setFocusDate((prev) => {
        const temp = new Date();
        const hitFloor =
          prev.year === YEAR_MIN && prev.month === 0 && direction === -1;
        const hitCeiling =
          prev.year === YEAR_MAX - 1 && prev.month === 11 && direction === 1;
        if (hitFloor) {
          temp.setDate(1);
          temp.setMonth(0);
          temp.setFullYear(YEAR_MIN);
        } else if (hitCeiling) {
          temp.setDate(31);
          temp.setMonth(11);
          temp.setFullYear(YEAR_MAX - 1);
        } else {
          temp.setDate(1);
          temp.setMonth(prev.month + direction);
          temp.setFullYear(prev.year);
          if (
            (prev.month === 0 && direction < 0) ||
            (prev.month === 11 && direction > 0)
          ) {
            temp.setFullYear(safeIncrementYear(prev.year, direction));
          }
        }
        return getDateMonthYear(temp);
      });
    },
    [setFocusDate]
  );

  const calendar = useMemo(() => {
    const { firstDateOnTheCalendar, lastDateOnTheCalendar } =
      getCalendarVariables(focusDate);

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
  }, [events, focusDate]);

  const renderMonthControls = useMemo(
    () => (
      <div
        className={clsx(
          "w-auto max-[400px]:w-full",
          "flex justify-center items-center gap-4"
        )}
      >
        <Button
          basic
          circular
          icon={"chevron left"}
          onClick={() => handleChangeTime(-1)}
          size={type === "mobile" ? "tiny" : undefined}
          disabled={focusDate.month === 0 && focusDate.year === YEAR_MIN}
        />
        <h1
          className={clsx(
            "text-primary-6 hover:text-primary-5 text-center cursor-pointer",
            type === "mobile" && "w-full !text-lg"
          )}
          onClick={() =>
            setModal(
              <ModalDateTimePick
                type="monthyear"
                onSelectDate={(date) => {
                  date && setFocusDate(getDateMonthYear(date));
                }}
              />
            )
          }
        >
          {strMonth(focusDate.month, 3)} {focusDate.year}
        </h1>
        <Button
          basic
          circular
          icon={"chevron right"}
          onClick={() => handleChangeTime(1)}
          size={type === "mobile" ? "tiny" : undefined}
          disabled={focusDate.month === 11 && focusDate.year === YEAR_MAX - 1}
        />
      </div>
    ),
    [
      focusDate.month,
      focusDate.year,
      handleChangeTime,
      setFocusDate,
      setModal,
      type,
    ]
  );

  const renderHead = useMemo(
    () => (
      <div className="flex flex-wrap gap-2 justify-between z-0">
        {renderMonthControls}
        <div className="w-auto max-[400px]:w-full flex flex-row-reverse">
          <EventButtonFilter
            size={type === "mobile" ? "tiny" : "medium"}
            stateFilters={stateFilters}
          />
        </div>
      </div>
    ),
    [renderMonthControls, stateFilters, type]
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
              label={<label>Show hidden events ({hiddenCount})</label>}
            />
          </div>
        )}
        {renderLegend}
      </div>
    ),
    [hiddenCount, renderLegend, setShowHidden, user]
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
                  {DAYS.map((_, idx2) => {
                    const { date } = calendar[7 * idx + idx2];

                    const safe = dateIsSafe(date);

                    return (
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
                          if (calendar && safe) {
                            setFocusDate(
                              getDateMonthYear(calendar[7 * idx + idx2].date)
                            );
                          }
                        }}
                        disabled={!safe}
                      />
                    );
                  })}
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
