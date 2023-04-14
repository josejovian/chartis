import { CSSProperties, useMemo } from "react";
import clsx from "clsx";
import { strMonth } from "@/utils";
import { CalendarDateType, ScreenSizeCategoryType } from "@/types";

export interface PageHomeCalendarDateProps {
  calendarDate?: CalendarDateType;
  countData: number[];
  type: ScreenSizeCategoryType;
  onClick: () => void;
}

export function PageHomeCalendarDate({
  calendarDate,
  countData,
  type,
  onClick,
}: PageHomeCalendarDateProps) {
  const month = calendarDate && calendarDate.date.getMonth();
  const date = calendarDate && calendarDate.date.getDate();
  const focus = calendarDate && calendarDate.focus;
  const events = calendarDate && calendarDate.events;
  const differentMonth = calendarDate && calendarDate.differentMonth;
  const count = events ? events.length : 0;
  const density = useMemo(() => {
    const x_low = countData.filter((x) => x)[0];
    const x_max = countData[countData.length - 1];
    const range = x_max - x_low;

    let level = 4;
    while (--level) {
      if (count >= x_low + range * ((level * 20) / 100)) break;
    }

    return level;
  }, [count, countData]);

  const renderDate = useMemo(() => {
    if (calendarDate && calendarDate.differentMonth)
      return (
        <div className="flex">
          <div className="flex justify-items-center">
            <span
              className={clsx(CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE)}
              style={CALENDAR_CELL_DATE_INLINE_STYLE}
            >
              {date}
            </span>
          </div>
          {type !== "mobile" && (
            <span
              className={clsx(
                CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE,
                date && date >= 10 && "ml-1"
              )}
            >
              {month !== undefined && strMonth(month, 3)}
            </span>
          )}
        </div>
      );

    return (
      <div
        className={clsx(
          "flex justify-items-center",
          CALENDAR_CELL_DATE_CURRENT_MONTH_WRAPPER_STYLE
          //focus //&& CALENDAR_CELL_FOCUS_STYLE
        )}
      >
        <span
          className={clsx(
            CALENDAR_CELL_DATE_CURRENT_MONTH_STYLE,
            !focus && CALENDAR_CELL_DATE_DENSITY_COLORS[density]
          )}
          style={CALENDAR_CELL_DATE_INLINE_STYLE}
        >
          {date}
        </span>
      </div>
    );
  }, [calendarDate, date, density, focus, month, type]);

  const renderDesktopCell = useMemo(
    () => (
      <td
        className={clsx(
          CALENDAR_CELL_BASE_STYLE,
          count > 0
            ? CALENDAR_CELL_DENSITY_COLORS[density]
            : differentMonth
            ? CALENDAR_CELL_DIFFERENT_MONTH_STYLE
            : CALENDAR_CELL_CURRENT_MONTH_STYLE,
          date,
          focus && CALENDAR_CELL_FOCUS_STYLE
        )}
        onClick={onClick}
      >
        <div className="flex flex-col justify-between h-full">
          {renderDate}
          <span
            className={clsx(
              CALENDAR_CELL_CAPTION_STYLE,
              CALENDAR_CELL_CAPTION_DENSITY_COLORS[density],
              type === "desktop_lg" ? "text-14px" : "text-12px",
              (events === undefined || count === 0) && "invisible"
            )}
          >
            {count} event
            {count > 1 && "s"}
          </span>
        </div>
      </td>
    ),
    [
      count,
      density,
      differentMonth,
      events,
      onClick,
      renderDate,
      type,
      date,
      focus,
    ]
  );

  const renderMobileCell = useMemo(
    () => (
      <td
        className={clsx(
          CALENDAR_CELL_BASE_STYLE,
          type === "mobile" && "!p-2",
          count > 0
            ? CALENDAR_CELL_DENSITY_COLORS[density]
            : differentMonth
            ? CALENDAR_CELL_DIFFERENT_MONTH_STYLE
            : CALENDAR_CELL_CURRENT_MONTH_STYLE
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center h-full">{renderDate}</div>
      </td>
    ),
    [count, density, differentMonth, onClick, renderDate, type]
  );

  const renderCell = useMemo(
    () => (type === "mobile" ? renderMobileCell : renderDesktopCell),
    [renderDesktopCell, renderMobileCell, type]
  );

  return <>{renderCell}</>;
}

const CALENDAR_CELL_BASE_STYLE = clsx(
  "px-3 py-3",
  "border-2 border-white align-top",
  "cursor-pointer transition-colors"
);
const CALENDAR_CELL_FOCUS_STYLE = "border-solid border-4 border-rose-500";

const CALENDAR_CELL_CURRENT_MONTH_STYLE = "bg-gray-100 hover:bg-white";
const CALENDAR_CELL_DIFFERENT_MONTH_STYLE = "bg-white hover:bg-gray-100";

const CALENDAR_CELL_DATE_STYLE =
  "text-16px uppercase text-center justify-center";
const CALENDAR_CELL_DATE_INLINE_STYLE: Partial<CSSProperties> = {
  width: "20px",
  display: "flex",
  textAlign: "center",
};
const CALENDAR_CELL_DATE_CURRENT_MONTH_STYLE = clsx(
  CALENDAR_CELL_DATE_STYLE,
  "text-16px uppercase"
);
const CALENDAR_CELL_DATE_CURRENT_MONTH_WRAPPER_STYLE = "w-fit p-2 -m-2";
const CALENDAR_CELL_DATE_DIFFERENT_MONTH_STYLE = clsx(
  CALENDAR_CELL_DATE_STYLE,
  "text-secondary-4"
);
const CALENDAR_CELL_CAPTION_STYLE = "text-right italic";

const CALENDAR_CELL_DENSITY_COLORS = [
  "bg-emerald-100 hover:bg-gray-50",
  "bg-emerald-300 hover:bg-emerald-200",
  "bg-emerald-600 hover:bg-emerald-500 text-secondary-2",
  "bg-emerald-800 hover:bg-emerald-700 text-secondary-2",
];
const CALENDAR_CELL_CAPTION_DENSITY_COLORS = [
  "text-secondary-5",
  "text-secondary-6",
  "text-secondary-2",
  "text-secondary-1",
];
const CALENDAR_CELL_DATE_DENSITY_COLORS = [
  "text-secondary-9",
  "text-secondary-9",
  "text-secondary-1",
  "text-secondary-1",
];
