import { useMemo, useState } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
} from "@/components";
import { EventModalTabType, EventType, StateObject } from "@/types";
import { EVENT_TAGS } from "@/consts";

export interface PageViewEventHeadProps {
  event: EventType;
  stateEdit: StateObject<boolean>;
}

export function PageViewEventHead({
  stateEdit,
  event,
}: PageViewEventHeadProps) {
  const stateActiveTab = useState(0);
  const activeTab = stateActiveTab[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setEdit = stateEdit[1];

  const crumb = useMemo(
    () => `Events / ${EVENT_TAGS[event.tags[0]].name} / ${event.name}`,
    [event.name, event.tags]
  );

  const tabs = useMemo<EventModalTabType[]>(
    () => [
      {
        name: "Details",
      },
    ],
    []
  );

  return (
    <div className="relative" style={{ height: "240px", minHeight: "240px" }}>
      <EventThumbnail
        className="!absolute !left-0 !top-0"
        type="banner"
        src="/placeholder.png"
      />
      <div
        className={clsx(
          "absolute w-full h-60",
          "bg-gradient-to-t from-zinc-900 to-zinc-400",
          "opacity-60"
        )}
      ></div>
      <div
        className={clsx(
          "absolute w-full h-60",
          "flex flex-col justify-between"
        )}
      >
        <span className="p-4 text-16px font-bold text-white drop-shadow-md">
          {crumb}
        </span>
        <div className="flex items-end h-20 justify-between">
          <div className="flex gap-4 px-4">
            {tabs.map(({ name, onClick }, idx) => (
              <Button
                key={`ModalViewEvent_Tab-${name}`}
                className={clsx(
                  "!rounded-none !m-0 !rounded-t-md !h-fit",
                  activeTab === idx &&
                    "!bg-white hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-200"
                )}
                onClick={onClick}
              >
                {name}
              </Button>
            ))}
          </div>
          <div className="flex items-between p-4 gap-4">
            <EventButtonFollow event={event} />
            <EventButtonMore />
          </div>
        </div>
      </div>
    </div>
  );
}
