import { useMemo } from "react";
import { EventCard } from "@/components";
import { EventType, ResponsiveInlineStyleType, StateObject } from "@/types";
import { strDate } from "@/utils";
import { useScreen } from "@/hooks";
import clsx from "clsx";
import { Icon } from "semantic-ui-react";
import Image from "next/image";

const SIDEBAR_WRAPPER_STYLE = clsx(
  "flex flex-col p-8",
  "bg-slate-100 overflow-x-hidden z-10 transition-all"
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
    height: "100%",
  },
};

export interface LayoutSidebarProps {
  focusDate: Date;
  events: EventType[];
  stateSideBar: StateObject<boolean>;
}

export function LayoutSidebar({
  focusDate,
  events,
  stateSideBar,
}: LayoutSidebarProps) {
  const [sideBar, setSideBar] = stateSideBar;
  const { type } = useScreen();

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
          />
        ))}
      </div>
    ),
    [events]
  );

  const renderEmpty = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center h-full">
        <Image
          src="/no-events.png"
          width="290"
          height="180"
          alt="No Events on This Date"
        />
        <span className="text-18px italic font-bold text-slate-500">
          It&apos;s Empty!
        </span>
        <span className="mt-1 text-16px italic text-slate-500">
          There are no events on this date.
        </span>
      </div>
    ),
    []
  );

  const renderSideBarContents = useMemo(
    () => (events.length > 0 ? renderEvents : renderEmpty),
    [events.length, renderEmpty, renderEvents]
  );

  return (
    <div
      className={SIDEBAR_WRAPPER_STYLE}
      style={SIDEBAR_WRAPPER_RESPONSIVE_STYLE[type]}
    >
      <div className={clsx(type === "mobile" ? "h-full" : "h-screen")}>
        {renderTitle}
        {renderSideBarContents}
      </div>
    </div>
  );
}
