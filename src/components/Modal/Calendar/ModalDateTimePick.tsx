import { DAYS, MONTHS, YEAR_MAX, YEAR_MIN } from "@/consts";
import { useModal, useScreen } from "@/hooks";
import { FocusDateType, ResponsiveStyleType } from "@/types";
import {
  calculateEarliestTenYears,
  getAmPm,
  getCalendarVariables,
  getDateMonthYear,
  safeIncrementMonth,
  safeIncrementYear,
  strDateTime,
} from "@/utils";
import clsx from "clsx";
import { ChangeEvent, ReactNode, useCallback, useMemo, useState } from "react";
import { Button, Icon } from "semantic-ui-react";

interface DateTimePickProps {
  hideToday?: boolean;
  hideReset?: boolean;
  defaultDate?: number;
  onSelectDate: (date?: Date) => void;
  type: "date" | "monthyear" | "time" | "datetime";
}

export function ModalDateTimePick({
  hideToday,
  hideReset,
  defaultDate,
  onSelectDate,
  type,
}: DateTimePickProps) {
  const today = useMemo(() => new Date().getTime(), []);
  const [date, setDate] = useState((() => defaultDate ?? today)());
  const [yearCursor, setYearCursor] = useState<number>(0);

  const dateObject = useMemo(() => new Date(date), [date]);

  const {
    currentYear,
    currentDate,
    currentHour,
    currentMinute,
    currentMonth,
    currentAmPm,
  } = useMemo(
    () => ({
      currentYear: dateObject.getFullYear(),
      currentMonth: dateObject.getMonth(),
      currentDate: dateObject.getDate(),
      currentHour: dateObject.getHours(),
      currentMinute: dateObject.getMinutes(),
      currentAmPm: getAmPm(dateObject.getHours()),
    }),
    [dateObject]
  );

  const [page, setPage] = useState<"date" | "month" | "year" | "time">(
    (() => {
      if (type === "date" || type === "datetime") return "date";
      if (type === "monthyear") return "year";
      return "date";
    })()
  );

  const { type: screenType } = useScreen();
  const { clearModal } = useModal();

  const handleUpdateDate = useCallback(
    ({
      day,
      month,
      year,
      hour,
      minute,
      onUpdate,
    }: Partial<FocusDateType> & { onUpdate?: (date: Date) => void }) => {
      const newDateObject = new Date(date);

      if (minute !== undefined) newDateObject.setMinutes(minute);
      if (hour !== undefined) newDateObject.setHours(hour);
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
          "w-full grid mt-4",
          screenType !== "mobile" ? ["grid-cols-4"] : ["grid-cols-3"]
        )}
      >
        {MONTHS.map((month, idx) => {
          return (
            <button
              className={clsx(
                DATE_SELECT_BUTTON_RESPONSIVE_STYLE[screenType],
                DATE_SELECT_BUTTON_STYLE,
                idx === currentMonth && DATE_SELECT_BUTTON_ACTIVE_STYLE
              )}
              onClick={() => {
                handleUpdateDate({
                  year: currentYear,
                  month: idx,
                  onUpdate: onSelectDate,
                });

                if (type === "monthyear") {
                  clearModal();
                } else {
                  setPage("date");
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
    [
      clearModal,
      currentMonth,
      currentYear,
      handleUpdateDate,
      onSelectDate,
      screenType,
      type,
    ]
  );

  const renderYearPicker = useMemo(() => {
    const earliestTenYear = calculateEarliestTenYears(currentYear, yearCursor);

    return (
      <div
        className={clsx(
          "grid mt-4",
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
                year === currentYear && DATE_SELECT_BUTTON_ACTIVE_STYLE,
                (idx === 0 || idx === 11) && "invisible"
              )}
              key={`Select_${idx}`}
              color={currentYear === year ? "yellow" : undefined}
              onClick={() => {
                handleUpdateDate({ year });
                setYearCursor(0);
                setPage("month");
              }}
            >
              {year}
            </button>
          );
        })}
      </div>
    );
  }, [currentYear, handleUpdateDate, screenType, yearCursor]);

  const renderDateInstance = useCallback(
    ({
      day,
      month,
      year,
      className,
      disabled,
    }: FocusDateType & {
      className?: string;
      disabled?: boolean;
    }) => (
      <button
        className={clsx(
          disabled && "invisible",
          "text-center !p-3",
          DATE_SELECT_BUTTON_STYLE,
          DATE_SELECT_BUTTON_RESPONSIVE_STYLE[screenType],
          className,
          currentDate === day &&
            currentMonth === month &&
            DATE_SELECT_BUTTON_ACTIVE_STYLE
        )}
        key={`Date_${day}`}
        onClick={() => {
          handleUpdateDate({
            day,
            month,
            year,
          });
        }}
        disabled={disabled}
      >
        {day}
      </button>
    ),
    [currentDate, currentMonth, handleUpdateDate, screenType]
  );

  const renderDatePicker = useMemo(() => {
    const { lastDateOfTheMonth, offsetDay, firstDateOnTheCalendar } =
      getCalendarVariables(getDateMonthYear(dateObject));

    return (
      <div className="grid grid-cols-7 mt-4 !w-full h-[300px]">
        {DAYS.map((day, idx) => (
          <div
            className={clsx(
              "text-center bg-gray-100 font-black !p-3",
              DATE_SELECT_BUTTON_RESPONSIVE_STYLE[screenType],
              idx === 0 && "rounded-l-lg",
              idx === 6 && "rounded-r-lg"
            )}
            key={`Date_Day_${day}`}
          >
            {day.slice(0, 1)}
          </div>
        ))}
        {Array.from({ length: offsetDay }).map((_, idx) => {
          const thisDate = new Date(firstDateOnTheCalendar);
          thisDate.setDate(thisDate.getDate() + idx);
          const year = thisDate.getFullYear();
          return renderDateInstance({
            ...getDateMonthYear(thisDate),
            className: "text-secondary-4",
            disabled: year < YEAR_MIN || year >= YEAR_MAX,
          });
        })}
        {Array.from({ length: lastDateOfTheMonth.getDate() }).map((_, idx) => {
          const date = idx + 1;
          return renderDateInstance({
            day: date,
            month: currentMonth,
            year: currentYear,
          });
        })}
        {Array.from({
          length: 42 - (offsetDay + lastDateOfTheMonth.getDate()),
        }).map((_, idx) => {
          const thisDate = new Date(lastDateOfTheMonth);
          thisDate.setDate(thisDate.getDate() + idx + 1);
          const year = thisDate.getFullYear();
          return renderDateInstance({
            ...getDateMonthYear(thisDate),
            className: "text-secondary-4",
            disabled: year < YEAR_MIN || year >= YEAR_MAX,
          });
        })}
      </div>
    );
  }, [currentMonth, currentYear, dateObject, renderDateInstance, screenType]);

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
          <h2 className="w-full">{title}</h2>
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

  const renderSelectYearScreen = useMemo(
    () => (
      <>
        {renderPickerHeader({
          title: currentYear,
          onClickLeft: () => {
            setYearCursor((prev) => {
              const newCursor = prev - 1;
              const newYear = calculateEarliestTenYears(currentYear, newCursor);
              return newYear >= YEAR_MIN ? prev - 1 : prev;
            });
          },
          disableLeft:
            calculateEarliestTenYears(currentYear, yearCursor) <= YEAR_MIN,
          onClickRight: () => {
            setYearCursor((prev) => {
              const newCursor = prev + 1;
              const newYear = calculateEarliestTenYears(currentYear, newCursor);
              return newYear < YEAR_MAX ? prev + 1 : prev;
            });
          },
          disableRight:
            calculateEarliestTenYears(currentYear, yearCursor + 1) >= YEAR_MAX,
        })}
        {renderYearPicker}
      </>
    ),
    [currentYear, renderPickerHeader, renderYearPicker, yearCursor]
  );

  const renderSelectMonthScreen = useMemo(
    () => (
      <>
        {renderPickerHeader({
          title: currentYear,
          onClickLeft: () => {
            handleUpdateDate({
              year: safeIncrementYear(currentYear, -1),
            });
          },
          disableLeft: currentYear - 1 < YEAR_MIN,
          onClickRight: () => {
            handleUpdateDate({
              year: safeIncrementYear(currentYear, 1),
            });
          },
          disableRight: currentYear + 1 >= YEAR_MAX,
        })}
        {renderMonthPicker}
      </>
    ),
    [currentYear, handleUpdateDate, renderMonthPicker, renderPickerHeader]
  );

  const handleValidateHours = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;

      input = input
        .split("")
        .filter((char) => char !== " " && !isNaN(Number(char)))
        .join("");

      let hours = Number(input);
      let hours24 = Number(input);

      if (input !== "" && !isNaN(hours) && !isNaN(hours24)) {
        if (hours <= 0) {
          hours = 12;
          hours24 = 0;
        } else if (hours > 24) {
          hours = 12;
          hours24 = 0;
        } else if (hours > 12) {
          hours -= 12;
        } else if (hours < 12) {
          hours24 = currentAmPm === "am" ? hours : 12 + hours;
        } else if (hours === 12) {
          hours24 = currentAmPm === "am" ? 0 : 12;
        }

        hours = Math.floor(hours);

        e.target.value = String(hours);
        handleUpdateDate({
          hour: hours24,
        });
      } else {
        e.target.value = input;
      }
    },
    [currentAmPm, handleUpdateDate]
  );

  const handleValidateMinutes = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value;

      input = input
        .split("")
        .filter((char) => char !== " " && !isNaN(Number(char)))
        .join("");

      let minutes = Number(input);

      if (input !== "" && !isNaN(minutes)) {
        if (minutes < 0) minutes = 0;
        if (minutes > 59) minutes = 59;
        e.target.value = String(minutes);
        handleUpdateDate({
          minute: minutes,
        });
      } else {
        e.target.value = input;
      }
    },
    [handleUpdateDate]
  );

  const renderTimePicker = useMemo(
    () => (
      <div className="flex items-center justify-center w-full gap-4 mt-4">
        <div className="flex items-center justify-center gap-2">
          <input
            className={INPUT_STYLE}
            type="text"
            onChange={handleValidateHours}
            defaultValue={
              currentHour > 12
                ? currentHour - 12
                : currentHour === 0
                ? 12
                : currentHour
            }
          />
          <span>:</span>
          <input
            className={INPUT_STYLE}
            type="text"
            onChange={handleValidateMinutes}
            defaultValue={currentMinute}
          />
        </div>
        <div className="flex">
          <Button
            className="!rounded-none !rounded-l-md"
            content="AM"
            color={currentAmPm === "am" ? "yellow" : undefined}
            onClick={() => {
              const hours = currentHour;
              handleUpdateDate({
                hour: hours >= 12 ? hours - 12 : hours,
                day: currentDate,
              });
            }}
          />
          <Button
            className="!rounded-none !rounded-r-md"
            content="PM"
            color={currentAmPm === "pm" ? "yellow" : undefined}
            onClick={() => {
              const hours = currentHour;
              handleUpdateDate({
                hour: hours < 12 ? hours + 12 : hours,
                day: currentDate,
              });
            }}
          />
        </div>
      </div>
    ),
    [
      currentAmPm,
      currentDate,
      currentHour,
      currentMinute,
      handleUpdateDate,
      handleValidateHours,
      handleValidateMinutes,
    ]
  );

  const renderSelectDateScreen = useMemo(
    () => (
      <>
        {renderPickerHeader({
          title: (
            <div
              className={clsx(
                "flex items-center gap-1 hover:text-secondary-5 cursor-pointer"
              )}
              onClick={() => {
                setPage("year");
              }}
            >
              {`${MONTHS[currentMonth].slice(0, 3)} ${currentYear}`}
              <Icon size="small" name="triangle down" />
            </div>
          ),
          onClickLeft: () => {
            const { month, year } = safeIncrementMonth(
              currentYear,
              currentMonth,
              -1
            );
            handleUpdateDate({
              month,
              year,
            });
          },
          disableLeft: currentYear - 1 < YEAR_MIN && currentMonth === 0,
          onClickRight: () => {
            const { month, year } = safeIncrementMonth(
              currentYear,
              currentMonth,
              1
            );
            handleUpdateDate({
              month,
              year,
            });
          },
          disableRight: currentYear + 1 >= YEAR_MAX && currentMonth === 11,
        })}

        {renderDatePicker}
        {renderTimePicker}
      </>
    ),
    [
      currentMonth,
      currentYear,
      handleUpdateDate,
      renderDatePicker,
      renderPickerHeader,
      renderTimePicker,
    ]
  );

  const renderContent = useMemo(() => {
    switch (page) {
      case "date":
        return renderSelectDateScreen;
      case "month":
        return renderSelectMonthScreen;
      case "year":
        return renderSelectYearScreen;
      default:
        return <></>;
    }
  }, [
    page,
    renderSelectDateScreen,
    renderSelectMonthScreen,
    renderSelectYearScreen,
  ]);

  return (
    <div
      className={clsx(
        "flex flex-col m-auto",
        screenType !== "mobile" ? "w-[640px]" : "w-full"
      )}
    >
      {renderContent}
      <div
        className={clsx(
          "flex items-center !h-fit  mt-4",
          hideToday ? "justify-between" : "justify-center",
          screenType !== "mobile" ? "gap-2" : "flex-col gap-4"
        )}
      >
        <Button
          className={clsx(hideToday && "!hidden")}
          disabled={hideToday}
          onClick={() => {
            setDate(new Date().getTime());
            onSelectDate(new Date());
            clearModal();
          }}
        >
          Today
        </Button>
        {type === "datetime" && page === "date" && (
          <>
            <span>
              <b>Selected Date:</b> {strDateTime(dateObject)}
            </span>
            <div className={clsx("flex justify-end gap-4")}>
              <Button
                basic
                onClick={clearModal}
                size={screenType === "mobile" ? "mini" : undefined}
              >
                Cancel
              </Button>
              {!hideReset && (
                <Button
                  onClick={() => {
                    onSelectDate && onSelectDate(undefined);
                    clearModal();
                  }}
                  size={screenType === "mobile" ? "mini" : undefined}
                >
                  Reset
                </Button>
              )}
              <Button
                color="yellow"
                onClick={() => {
                  onSelectDate(dateObject);
                  clearModal();
                }}
                size={screenType === "mobile" ? "mini" : undefined}
              >
                Finish
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
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

const INPUT_STYLE = clsx(
  "w-12 bg-secondary-1 hover:bg-secondary-2",
  "active:bg-primary-1 focus:bg-primary-1 !p-3 !outline-none !rounded-md"
);
