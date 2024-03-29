import { useCallback, useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { EventCard, LayoutNotice } from "@/components";
import {
  EventType,
  FocusDateType,
  IdentificationType,
  ResponsiveInlineStyleType,
  StateObject,
} from "@/types";
import { parseFromDateMonthYear, strDate } from "@/utils";
import { useScreen } from "@/hooks";
import { ASSET_NO_CONTENT } from "@/consts";

export interface PageHomeSideBarProps {
  focusDate: FocusDateType;
  events: EventType[];
  identification: IdentificationType;
  stateSideBar: StateObject<boolean>;
  extraDeleteHandler: (eventId: string) => void;
  updateClientSideEvent: (eventId: string, event: Partial<EventType>) => void;
  subscribedIds: Record<string, number>;
  updateUserSubscribedEventClientSide: (
    eventId: string,
    version?: number
  ) => void;
}

export function PageHomeSideBar({
  focusDate,
  events,
  stateSideBar,
  subscribedIds,
  extraDeleteHandler,
  updateClientSideEvent,
  updateUserSubscribedEventClientSide,
}: PageHomeSideBarProps) {
  const [sideBar, setSideBar] = stateSideBar;
  const { type } = useScreen();

  const checkForSubscribed = useCallback(
    (id: string) => Boolean(typeof subscribedIds[id] === "number"),
    [subscribedIds]
  );

  const renderTitle = useMemo(
    () => (
      <div className="flex items-center justify-between mb-8">
        <span className="text-16px text-secondary-6 italic">
          Showing {events.length} events on{" "}
          {strDate(parseFromDateMonthYear(focusDate))}
        </span>
        {type === "mobile" && (
          <div
            className={clsx(
              "!w-8 !h-8 flex justify-center !m-0",
              "rounded-md hover:bg-secondary-2"
            )}
            style={{
              paddingTop: "0.35rem",
              paddingLeft: "0.15rem",
            }}
            onClick={() => {
              setSideBar((prev) => !prev);
            }}
          >
            <Icon
              className="!m-0"
              name={`chevron ${sideBar ? "down" : "up"}`}
            />
          </div>
        )}
      </div>
    ),
    [events.length, focusDate, setSideBar, sideBar, type]
  );

  const renderEvents = useMemo(
    () => (
      <div className="flex flex-col gap-8">
        {events.map((event, _) => (
          <EventCard
            key={`EventCard_${event.id}`}
            event={event}
            subscribed={checkForSubscribed(event.id)}
            updateUserSubscribedEventClientSide={
              updateUserSubscribedEventClientSide
            }
            updateClientSideEvent={updateClientSideEvent}
            extraDeleteHandler={extraDeleteHandler}
          />
        ))}
      </div>
    ),
    [
      checkForSubscribed,
      events,
      extraDeleteHandler,
      updateClientSideEvent,
      updateUserSubscribedEventClientSide,
    ]
  );

  const renderEmpty = useMemo(
    () => (
      <LayoutNotice
        illustration={ASSET_NO_CONTENT}
        title="It's Empty"
        description="There are no events on this date."
      />
    ),
    []
  );

  const renderSideBarContents = useMemo(
    () => (events.length > 0 ? renderEvents : renderEmpty),
    [events.length, renderEmpty, renderEvents]
  );

  return (
    <div
      className={clsx(
        SIDEBAR_WRAPPER_STYLE,
        sideBar && ["fixed left-0 bottom-0"]
      )}
      style={{
        ...SIDEBAR_WRAPPER_RESPONSIVE_STYLE[type],
        zIndex: 8,
        height:
          sideBar && type !== "mobile"
            ? "100%"
            : type === "mobile"
            ? "calc(100% - 64px)"
            : undefined,
      }}
    >
      <div>
        {renderTitle}
        {renderSideBarContents}
      </div>
    </div>
  );
}

const SIDEBAR_WRAPPER_STYLE = clsx(
  "flex flex-col p-8",
  "bg-slate-100 overflow-x-hidden overflow-y-scroll"
);

const SIDEBAR_WRAPPER_RESPONSIVE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: {
    height: "100vh",
    width: "600px",
  },
  desktop_sm: {
    height: "100vh",
    width: "550px",
  },
  mobile: {
    width: "100vw",
    height: "100%",
  },
};
