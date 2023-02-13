import { useMemo } from "react";
import { EventCard } from "@/components";
import { EventType } from "@/types";
import { strDate } from "@/utils";

export interface LayoutSidebarProps {
  focusDate: Date;
  events: EventType[];
}

export function LayoutSidebar({ focusDate, events }: LayoutSidebarProps) {
  const renderTitle = useMemo(
    () => (
      <span className="mb-8 text-16px text-secondary-6 italic">
        Showing {events.length} events on {strDate(focusDate)}
      </span>
    ),
    [events.length, focusDate]
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

  return (
    <div
      className="flex flex-col p-8 bg-slate-100 overflow-x-hidden overflow-y-scroll h-screen"
      style={{ minWidth: "504px" }}
    >
      {renderTitle}
      {renderEvents}
    </div>
  );
}
