import { useCallback, useMemo, useState } from "react";
import { Button, Icon, Input } from "semantic-ui-react";
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
} from "@/types";
import { EVENT_TAGS } from "@/consts";
import { useFormikContext } from "formik";

export interface PageViewEventHeadProps {
  event: EventType;
  identification: IdentificationType;
  onDelete: () => void;
  stateDeleting?: StateObject<boolean>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
}

export function PageViewEventHead({
  event,
  identification,
  onDelete,
  stateDeleting,
  stateMode,
  type,
  updateEvent,
}: PageViewEventHeadProps) {
  const stateActiveTab = useState(0);
  const activeTab = stateActiveTab[0];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mode, setMode] = stateMode;
  const thumbnailURLState = useState(event.thumbnailSrc);
  const [thumbnailURL, setThumbnailURL] = thumbnailURLState;
  const { setFieldValue } = useFormikContext() ?? {};
  const crumb = useMemo(
    () =>
      event.tags.length > 0 &&
      `Events / ${EVENT_TAGS[event.tags[0]].name} / ${event.name}`,
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

  const renderEditTabs = useMemo(
    () => (
      <div className="flex items-between p-4 gap-4 ml-auto">
        <Button htmlFor="file-input" style={{ padding: "0" }}>
          <label
            htmlFor="file-input"
            style={{
              display: "block",
              height: "100%",
              width: "100%",
              padding: "0.8rem",
            }}
          >
            <Icon
              name="camera"
              style={{
                margin: "0",
                padding: "0",
              }}
            ></Icon>
          </label>
        </Button>
        <Input
          id="file-input"
          name="thumbnailSrc"
          type="file"
          accept="image/*"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(event: any) => {
            setFieldValue("thumbnailSrc", event.target.files[0]);
            setThumbnailURL(URL.createObjectURL(event.target.files[0]));
          }}
          style={{ display: "none" }}
        />
      </div>
    ),
    [setFieldValue, setThumbnailURL]
  );

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
        src={thumbnailURL}
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
        <div className="flex items-end w-full h-full justify-between">
          {mode === "view" ? renderViewTabs : renderEditTabs}
        </div>
      </div>
    </div>
  );
}
