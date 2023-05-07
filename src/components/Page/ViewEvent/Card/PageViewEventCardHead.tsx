import { useCallback, useMemo, useState } from "react";
import { Button, Icon, Input, Label } from "semantic-ui-react";
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
import { useAuthorization, useReport } from "@/hooks";
import { getAuth } from "firebase/auth";
import { useFormikContext } from "formik";

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
  const thumbnailURLState = useState(event.thumbnailSrc);
  const [thumbnailURL, setThumbnailURL] = thumbnailURLState;
  const { setFieldValue } = useFormikContext() ?? {};
  const identification = stateIdentification[0];
  const { user } = identification;
  const { showReportModal } = useReport();
  const auth = getAuth();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    permission: "admin",
  });

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
        icon: "info circle",
        onClick: () => {
          setActiveTab("detail");
        },
      },
      {
        id: "updates",
        name: "Updates",
        icon: "history",
        onClick: () => {
          setActiveTab("updates");
        },
        count: event.version ?? 0,
      },
      {
        id: "discussion",
        name: "Discussion",
        icon: "discussions",
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
      <div className={clsx("flex gap-4 px-4")}>
        {tabs
          .filter(({ permission }) => !permission || isAuthorized)
          .map(({ id, name, onClick, count }) => (
            <Button
              key={`ModalViewEvent_Tab-${name}`}
              className={clsx(
                "!relative !flex !items-center !rounded-none !m-0 !rounded-t-md !h-11",
                activeTab === id &&
                  "!bg-white hover:!bg-gray-100 active:!bg-gray-200 focus:!bg-gray-200"
              )}
              size={type === "mobile" ? "tiny" : undefined}
              onClick={onClick}
            >
              {name}
              {count !== undefined && (
                <Label
                  className={clsx(
                    "!py-1.5",
                    type === "mobile" ? "!ml-4" : "!ml-2"
                  )}
                  color="grey"
                >
                  {count}
                </Label>
              )}
            </Button>
          ))}
      </div>
    ),
    [activeTab, isAuthorized, tabs, type]
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
              eventId: event.id,
              authorId: event.authorId,
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
    <div
      className="relative"
      style={{
        height: type !== "mobile" ? "240px" : "320px",
        minHeight: type !== "mobile" ? "240px" : "320px",
      }}
    >
      <EventThumbnail
        className="!absolute !left-0 !top-0"
        type="banner"
        src={thumbnailURL}
        screenType={type}
      />
      <div
        className={clsx(
          "absolute w-full h-full",
          "bg-gradient-to-t from-zinc-900 to-zinc-400",
          "opacity-60"
        )}
      ></div>
      <div
        className={clsx(
          "absolute w-full h-full",
          "flex flex-col justify-between"
        )}
      >
        {mode === "view" && renderCrumb}
        <div className={clsx("flex items-end justify-between")}>
          {mode === "view" ? renderViewTabs : renderEditTabs}
        </div>
      </div>
    </div>
  );
}
