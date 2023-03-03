import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { EventCard, LayoutNotice } from "@/components";
import { EventType, ResponsiveInlineStyleType, StateObject } from "@/types";
import { strDate } from "@/utils";
import { useIdentification, useScreen } from "@/hooks";

export interface PageHomeSideBarProps {
  focusDate: Date;
  events: EventType[];
  stateSideBar: StateObject<boolean>;
}

export function PageHomeSideBar({
  focusDate,
  events,
  stateSideBar,
}: PageHomeSideBarProps) {
  const [sideBar, setSideBar] = stateSideBar;
  const { type } = useScreen();
  const stateIdentification = useIdentification();
  const identification = stateIdentification[0];

  const renderTitle = useMemo(
    () => (
      <div className="flex items-center justify-between mb-8">
        <span className="text-16px text-secondary-6 italic">
          Showing {events.length} events on {strDate(focusDate)}
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
        {events.map((event, idx) => (
          <EventCard
            key={`EventCard_${event.id}`}
            event={{
              ...event,
              id: `${idx}`,
            }}
            identification={identification}
          />
        ))}
      </div>
    ),
    [events, identification]
  );

  const renderEmpty = useMemo(
    () => (
      <LayoutNotice
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
        sideBar ? ["fixed left-0 bottom-0"] : [type === "mobile" && "h-full"]
      )}
      style={{
        ...SIDEBAR_WRAPPER_RESPONSIVE_STYLE[type],
        height: sideBar ? "calc(100vh - 64px)" : undefined,
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
  "bg-slate-100 overflow-x-hidden overflow-y-scroll z-10"
);

const SIDEBAR_WRAPPER_RESPONSIVE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: {
    height: "100vh",
    minWidth: "504px",
  },
  desktop_sm: {
    height: "100vh",
    minWidth: "400px",
  },
  mobile: {
    width: "100vw",
    height: "100%",
  },
};
