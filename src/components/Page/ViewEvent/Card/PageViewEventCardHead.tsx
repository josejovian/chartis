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
import { useReport } from "@/hooks";

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
  updateUserSubscribedEventClientSide: (
    userId: string,
    eventId: string,
    version?: number
  ) => void;
}

export function PageViewEventHead({
  stateActiveTab,
  event,
  stateIdentification,
  onDelete,
  stateDeleting,
  stateModalDelete,
  stateMode,
  type,
  updateEvent,
  updateUserSubscribedEventClientSide,
}: PageViewEventHeadProps) {
  const [activeTab, setActiveTab] = stateActiveTab;
  const [mode, setMode] = stateMode;
  const identification = stateIdentification[0];
  const { user } = identification;
  const { showReportModal } = useReport();

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
        count: event.version ?? 0,
      },
      {
        id: "discussion",
        name: "Discussion",
        onClick: () => {
          setActiveTab("discussion");
        },
        count: event.commentCount ?? 0,
      },
    ],
    [event, setActiveTab]
  );

  const handleEdit = useCallback(() => {
    setActiveTab("detail");
    setMode("edit");
  }, [setActiveTab, setMode]);

  const renderDetailTabs = useMemo(
    () => (
      <div className="flex gap-4 px-4">
        {tabs.map(({ id, name, onClick, count }) => (
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
            {count !== undefined && (
              <Label className="!ml-2 !py-1.5" color="grey">
                {count}
              </Label>
            )}
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
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
          size={type === "mobile" ? "tiny" : undefined}
          updateEvent={updateEvent}
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size={type === "mobile" ? "tiny" : undefined}
          stateDeleting={stateDeleting}
          stateModalDelete={stateModalDelete}
          onEdit={handleEdit}
          onDelete={onDelete}
          onReport={() =>
            showReportModal({
              contentId: event.id,
              contentType: "event",
              reportedBy: user ? user.uid : "",
            })
          }
        />
      </div>
    ),
    [
      event,
      identification,
      updateUserSubscribedEventClientSide,
      type,
      updateEvent,
      stateDeleting,
      stateModalDelete,
      handleEdit,
      onDelete,
      showReportModal,
      user,
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
