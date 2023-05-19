import { DAYS, MONTHS, YEAR_MAX, YEAR_MIN } from "@/consts";
import { useModal, useScreen } from "@/hooks";
import { FocusDateType, ResponsiveStyleType } from "@/types";
import {
  calculateEarliestTenYears,
  getCalendarVariables,
  getDateMonthYear,
  safeIncrementYear,
} from "@/utils";
import clsx from "clsx";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Button, Icon } from "semantic-ui-react";

interface DateTimePickProps {
  defaultDate?: number;
  onSelectDate: (date: Date) => void;
  type: "date" | "monthyear" | "time";
}

export function ModalDateTimePick({
  defaultDate,
  onSelectDate,
  type,
}: DateTimePickProps) {
  const today = useMemo(() => new Date().getTime(), []);
  const [date, setDate] = useState((() => defaultDate ?? today)());
  const [yearCursor, setYearCursor] = useState<number>(0);

  const dateObject = useMemo(() => new Date(date), [date]);
  const [page, setPage] = useState<"date" | "month" | "year" | "time">(
    (() => {
      switch (type) {
        case "date":
          return "date";
        case "monthyear":
          return "year";
        case "time":
          return "time";
      }
    })()
  );

  const { type: screenType } = useScreen();
  const { clearModal } = useModal();

  const handleUpdateDate = useCallback(
    ({
      day,
      month,
      year,
      onUpdate,
    }: Partial<FocusDateType> & { onUpdate?: (date: Date) => void }) => {
      const newDateObject = new Date(date);

      if (day) newDateObject.setDate(day);
      if (month !== undefined) newDateObject.setMonth(month);
      if (year) newDateObject.setFullYear(year);

      const time = newDateObject.getTime();
      onUpdate && onUpdate(newDateObject);
      setDate(time);
    },
    [date]
  );

  const renderMonthPicker = useMemo(
    () => (
      <div
        className={clsx(
          "w-full grid gap-2 mt-4",
          screenType !== "mobile" ? ["grid-cols-4"] : ["grid-cols-3"]
        )}
      >
        {MONTHS.map((month, idx) => {
          return (
            <button
              className={clsx(
                DATE_SELECT_BUTTON_RESPONSIVE_STYLE[screenType],
                DATE_SELECT_BUTTON_STYLE,
                idx === dateObject.getMonth() && DATE_SELECT_BUTTON_ACTIVE_STYLE
              )}
              onClick={() => {
                handleUpdateDate({
                  year: dateObject.getFullYear(),
                  month: idx,
                  onUpdate: onSelectDate,
                });

                if (type === "monthyear") {
                  clearModal();
                }
              }}
              key={`Date_${month}`}
            >
              {MONTHS[idx].slice(0, 3)}
            </button>
          );
        })}
      </div>
    ),
    [clearModal, dateObject, handleUpdateDate, onSelectDate, screenType, type]
  );

  const renderYearPicker = useMemo(() => {
    const currentYear = dateObject.getFullYear();
    const earliestTenYear = calculateEarliestTenYears(currentYear, yearCursor);

    return (
      <div
        className={clsx(
          "grid gap-2 mt-4",
          screenType !== "mobile"
            ? ["grid-cols-4"]
            : ["grid-cols-3 sm:grid-cols-4"]
        )}
      >
        {Array.from({ length: 12 }).map((_, idx) => {
          const year = idx + earliestTenYear - 1;

          return (
            <button
              className={clsx(
                DATE_SELECT_BUTTON_RESPONSIVE_STYLE[screenType],
                DATE_SELECT_BUTTON_STYLE,
                year === dateObject.getFullYear() &&
                  DATE_SELECT_BUTTON_ACTIVE_STYLE,
                (idx === 0 || idx === 11) && "invisible"
              )}
              key={`Select_${idx}`}
              color={dateObject.getFullYear() === year ? "yellow" : undefined}
              onClick={() => {
                handleUpdateDate({ year });
                setYearCursor(0);
                if (type === "monthyear") {
                  setPage("month");
                }
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
    );
  }, [dateObject, handleUpdateDate, screenType, type, yearCursor]);

  const renderDatePicker = useMemo(() => {
    const { lastDateOfTheMonth, offsetDay } = getCalendarVariables(
      getDateMonthYear(dateObject)
    );

    return (
      <div className="grid grid-cols-7 mt-4 !w-full">
        {DAYS.map((day) => (
          <button
            tabIndex={0}
            className={clsx(
              date <= 0 && "invisible",
              screenType !== "mobile" ? "!w-16 !h-16" : "!w-full !h-16",
              "bg-white hover:bg-secondary-1 active:bg-secondary-2 focus:bg-secondary-2"
            )}
            key={`Date_${date}`}
          >
            {day.slice(0, 1)}
          </button>
        ))}
        {Array.from({ length: lastDateOfTheMonth.getDate() + offsetDay }).map(
          (_, idx) => {
            const date = idx - offsetDay + 1;
            return (
              <button
                tabIndex={0}
                className={clsx(
                  date <= 0 && "invisible",
                  screenType !== "mobile" ? "!w-16 !h-16" : "!w-full !h-16",
                  "bg-white hover:bg-secondary-1 active:bg-secondary-2 focus:bg-secondary-2"
                )}
                key={`Date_${date}`}
                onClick={() => {
                  console.log("X");
                }}
              >
                {date}
              </button>
            );
          }
        )}
      </div>
    );
  }, [date, dateObject, screenType]);

  const renderPickerHeader = useCallback(
    ({
      title,
      onClickLeft,
      onClickRight,
      disableLeft,
      disableRight,
    }: {
      title: ReactNode;
      onClickLeft: () => void;
      onClickRight: () => void;
      disableLeft?: boolean;
      disableRight?: boolean;
    }) => {
      return (
        <div className="flex justify-between w-full">
          <h2 className="w-full pl-4">{title}</h2>
          <div className="flex gap-2">
            <Button
              size="tiny"
              icon
              circular
              onClick={onClickLeft}
              disabled={disableLeft}
            >
              <Icon name="angle left" />
            </Button>
            <Button
              size="tiny"
              icon
              circular
              onClick={onClickRight}
              disabled={disableRight}
            >
              <Icon name="angle right" />
            </Button>
          </div>
        </div>
      );
    },
    []
  );

  const renderMonthYearTypeScreen = useMemo(() => {
    if (page === "year") {
      return (
        <>
          {renderPickerHeader({
            title: dateObject.getFullYear(),
            onClickLeft: () => {
              setYearCursor((prev) => {
                const newCursor = prev - 1;
                const newYear = calculateEarliestTenYears(
                  dateObject.getFullYear(),
                  newCursor
                );
                return newYear >= YEAR_MIN ? prev - 1 : prev;
              });
            },
            disableLeft:
              calculateEarliestTenYears(dateObject.getFullYear(), yearCursor) <=
              YEAR_MIN,
            onClickRight: () => {
              setYearCursor((prev) => {
                const newCursor = prev + 1;
                const newYear = calculateEarliestTenYears(
                  dateObject.getFullYear(),
                  newCursor
                );
                return newYear < YEAR_MAX ? prev + 1 : prev;
              });
            },
            disableRight:
              calculateEarliestTenYears(
                dateObject.getFullYear(),
                yearCursor + 1
              ) >= YEAR_MAX,
          })}
          {renderYearPicker}
        </>
      );
    } else {
      return (
        <>
          {renderPickerHeader({
            title: dateObject.getFullYear(),
            onClickLeft: () => {
              handleUpdateDate({
                year: safeIncrementYear(dateObject.getFullYear(), -1),
              });
            },
            disableLeft: dateObject.getFullYear() - 1 < YEAR_MIN,
            onClickRight: () => {
              handleUpdateDate({
                year: safeIncrementYear(dateObject.getFullYear(), 1),
              });
            },
            disableRight: dateObject.getFullYear() + 1 >= YEAR_MAX,
          })}
          {renderMonthPicker}
        </>
      );
    }
  }, [
    dateObject,
    handleUpdateDate,
    page,
    renderMonthPicker,
    renderPickerHeader,
    renderYearPicker,
    yearCursor,
  ]);

  if (type === "monthyear") {
    return (
      <div
        className={clsx(
          "flex flex-col m-auto",
          screenType !== "mobile" ? "w-96" : "w-full"
        )}
      >
        {renderMonthYearTypeScreen}
        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={() => {
              setDate(new Date().getTime());
              onSelectDate(new Date());
              clearModal();
            }}
          >
            Today
          </Button>
        </div>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div
        className="flex flex-col w-full mx-auto"
        style={{
          maxWidth: "600px",
        }}
      >
        <div className="flex items-between w-full">
          <div className="flex w-full gap-4">
            <h2>Dec</h2>
            <h2>2033</h2>
          </div>
          <Button
            size="tiny"
            icon
            circular
            onClick={() => {
              setYearCursor((prev) => prev - 1);
            }}
          >
            <Icon name="angle left" />
          </Button>
          <Button
            size="tiny"
            icon
            circular
            onClick={() => {
              setYearCursor((prev) => prev + 1);
            }}
          >
            <Icon name="angle right" />
          </Button>
        </div>
        <div>{renderDatePicker}</div>
      </div>
    );
  }

  return <div></div>;
}

const DATE_SELECT_BUTTON_STYLE = clsx(
  "hover:bg-primary-1 hover:text-primary-5",
  "active:bg-primary-2 active:text-primary-6",
  "transition-all rounded-md"
);

const DATE_SELECT_BUTTON_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "py-4",
  desktop_sm: "py-4",
  mobile: "py-3",
};

const DATE_SELECT_BUTTON_ACTIVE_STYLE = "bg-primary-2 text-primary-6 font-bold";
