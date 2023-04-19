import { useCallback, useMemo, useState } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
} from "@/components";
import {
  EventModalTabType,
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
  IdentificationType,
  EventTagNameType,
} from "@/types";
import { EVENT_TAGS } from "@/consts";

export interface PageViewEventHeadProps {
  event: EventType;
  identification: IdentificationType;
  onDelete: () => void;
  stateDeleting?: StateObject<boolean>;
  stateModalDelete: StateObject<boolean>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
}

export function PageViewEventHead({
  event,
  identification,
  onDelete,
  stateDeleting,
  stateModalDelete,
  stateMode,
  type,
  updateEvent,
}: PageViewEventHeadProps) {
  const stateActiveTab = useState(0);
  const activeTab = stateActiveTab[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mode, setMode] = stateMode;

  const crumb = useMemo(
    () =>
      Object.keys(event.tags).length > 0 &&
      `Events / ${
        EVENT_TAGS[Object.keys(event.tags)[0] as EventTagNameType].name
      } / ${event.name}`,
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

  const handleEdit = useCallback(() => {
    setMode("edit");
  }, [setMode]);

  const renderDetailTabs = useMemo(
    () => (
      <div className="flex gap-4 px-4">
        {tabs.map(({ name, onClick }, idx) => (
          <Button
            key={`ModalViewEvent_Tab-${name}`}
            className={clsx(
              "!rounded-none !m-0 !rounded-t-md !h-fit",
              activeTab === idx &&
                "!bg-white hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-200"
            )}
            size={type === "mobile" ? "tiny" : undefined}
            onClick={onClick}
          >
            {name}
          </Button>
        ))}
      </div>
    ),
    [activeTab, tabs, type]
  );

  const renderActionTabs = useMemo(
    () => (
      <div className="flex items-between p-4 gap-4">
        <EventButtonFollow
          event={event}
          identification={identification}
          size={type === "mobile" ? "tiny" : undefined}
          updateEvent={updateEvent}
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size={type === "mobile" ? "tiny" : undefined}
          onEdit={handleEdit}
          onDelete={onDelete}
          stateDeleting={stateDeleting}
          stateModalDelete={stateModalDelete}
        />
      </div>
    ),
    [
      event,
      identification,
      type,
      updateEvent,
      handleEdit,
      onDelete,
      stateDeleting,
      stateModalDelete,
    ]
  );

  const renderViewTabs = useMemo(
    () => (
      <>
        {renderDetailTabs}
        {renderActionTabs}
      </>
    ),
    [renderActionTabs, renderDetailTabs]
  );

  const renderEditTabs = useMemo(() => <></>, []);

  const renderCrumb = useMemo(
    () => (
      <span className="p-4 text-16px font-bold text-white drop-shadow-md">
        {crumb}
      </span>
    ),
    [crumb]
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
        {mode === "view" && renderCrumb}
        <div className="flex items-end h-20 justify-between">
          {mode === "view" ? renderViewTabs : renderEditTabs}
        </div>
      </div>
    </div>
  );
}
