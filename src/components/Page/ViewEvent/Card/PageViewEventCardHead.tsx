import { useCallback, useMemo } from "react";
import { Button, Label } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventThumbnail,
  EventButtonFollow,
  EventButtonMore,
} from "@/components";
import {
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
  IdentificationType,
  EventTagNameType,
  EventCardTabType,
  EventCardTabNameType,
} from "@/types";
import { EVENT_TAGS } from "@/consts";

export interface PageViewEventHeadProps {
  event: EventType;
  stateIdentification: StateObject<IdentificationType>;
  onDelete: () => void;
  stateActiveTab: StateObject<EventCardTabNameType>;
  stateDeleting?: StateObject<boolean>;
  stateModalDelete: StateObject<boolean>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
}

export function PageViewEventHead({
  event,
  stateIdentification,
  onDelete,
  stateActiveTab,
  stateDeleting,
  stateModalDelete,
  stateMode,
  type,
  updateEvent,
}: PageViewEventHeadProps) {
  const [activeTab, setActiveTab] = stateActiveTab;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mode, setMode] = stateMode;

  const identification = stateIdentification[0];

  const crumb = useMemo(
    () =>
      Object.keys(event.tags).length > 0 &&
      `Events / ${
        EVENT_TAGS[Object.keys(event.tags)[0] as EventTagNameType].name
      } / ${event.name}`,
    [event.name, event.tags]
  );

  const tabs = useMemo<EventCardTabType[]>(
    () => [
      {
        id: "detail",
        name: "Detail",
        onClick: () => {
          setActiveTab("detail");
        },
      },
      {
        id: "updates",
        name: "Updates",
        onClick: () => {
          setActiveTab("updates");
        },
      },
    ],
    [setActiveTab]
  );

  const handleEdit = useCallback(() => {
    setActiveTab("detail");
    setMode("edit");
  }, [setActiveTab, setMode]);

  const renderDetailTabs = useMemo(
    () => (
      <div className="flex gap-4 px-4">
        {tabs.map(({ id, name, onClick }) => (
          <Button
            key={`ModalViewEvent_Tab-${name}`}
            className={clsx(
              "!flex !items-center !rounded-none !m-0 !rounded-t-md !h-11",
              activeTab === id &&
                "!bg-white hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-200"
            )}
            size={type === "mobile" ? "tiny" : undefined}
            onClick={onClick}
          >
            {name}
            {id === "updates" && (
              <Label className="!ml-2 !py-1.5" color="grey">
                {event.version ?? 0}
              </Label>
            )}
          </Button>
        ))}
      </div>
    ),
    [activeTab, event, tabs, type]
  );

  const renderActionTabs = useMemo(
    () => (
      <div className="flex items-between p-4 gap-4">
        <EventButtonFollow
          event={event}
          stateIdentification={stateIdentification}
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
      stateIdentification,
      type,
      updateEvent,
      identification,
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
