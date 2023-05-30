import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Icon, Label } from "semantic-ui-react";
import clsx from "clsx";
import { EventThumbnail, FormErrorMessage } from "@/components";
import {
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
  IdentificationType,
  EventCardTabType,
  EventCardTabNameType,
} from "@/types";
import { useAuthorization } from "@/hooks";
import { getAuth } from "firebase/auth";
import { Field } from "formik";

export interface PageViewEventHeadProps {
  event: EventType;
  stateIdentification: StateObject<IdentificationType>;
  onDelete: () => void;
  stateActiveTab: StateObject<EventCardTabNameType>;
  stateDeleting?: StateObject<boolean>;
  stateModalDelete: StateObject<boolean>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateUserSubscribedEventClientSide: (
    eventId: string,
    version?: number
  ) => void;
  cardHeight?: number;
  stateFocused: StateObject<boolean>;
  stateLoading: StateObject<boolean>;
  setFieldValue?: (
    field: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
}

export function PageViewEventHead({
  stateActiveTab,
  event,
  stateIdentification,
  stateMode,
  type,
  cardHeight,
  stateFocused,
  stateLoading,
  setFieldValue,
}: PageViewEventHeadProps) {
  const imageRef = createRef<HTMLImageElement>();
  const [focused, setFocused] = stateFocused;
  const setLoading = stateLoading[1];
  const [activeTab, setActiveTab] = stateActiveTab;
  const [mode] = stateMode;
  const thumbnailURLState = useState(event.thumbnailSrc);
  const [thumbnailURL, setThumbnailURL] = thumbnailURLState;
  const auth = getAuth();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "admin",
  });
  const [imageSize, setImageSize] = useState<[number, number]>();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const listener = useRef(false);

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

  const renderDetailTabs = useMemo(
    () => (
      <div
        className={clsx("flex flex-wrap gap-4", type !== "mobile" && "px-4")}
      >
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
                  floating={type === "mobile"}
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

  const renderViewTabs = useMemo(
    () => <>{renderDetailTabs}</>,
    [renderDetailTabs]
  );

  const renderEditTabs = useMemo(
    () => (
      <div className="flex items-between p-4 gap-4 ml-auto">
        <Field name="thumbnailSrc">
          {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ({ meta }: any) => (
              <>
                <Button
                  htmlFor="file-input"
                  className="p-0 h-16"
                  icon
                  labelPosition="left"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Icon name="camera" />
                  Upload Thumbnail
                </Button>
                <FormErrorMessage
                  error={meta.error}
                  showError={meta.touched && meta.error}
                  className="absolute bg-white -mx-2 !z-50"
                  overlap
                />
                <input
                  id="file-input"
                  name="thumbnailSrc"
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(event: any) => {
                    setFieldValue &&
                      setFieldValue("thumbnailSrc", event.target.files[0]);
                    setThumbnailURL(URL.createObjectURL(event.target.files[0]));
                  }}
                  style={{ display: "none" }}
                />
              </>
            )
          }
        </Field>
      </div>
    ),
    [setFieldValue, setThumbnailURL]
  );

  const handleAdjustImageSize = useCallback(() => {
    const element = document.getElementsByClassName("EventThumbnail")[0];

    if (!event.thumbnailSrc) {
      setFocused(false);
      setLoading(false);
    } else if (element && cardHeight) {
      const image = element as HTMLImageElement;

      const ratio = image.naturalWidth / (image.naturalHeight + 0.01);

      const imgWidth = cardHeight * ratio;
      const imgHeight = cardHeight;

      if (imgWidth > 0 && imgHeight > 0) {
        setImageSize([cardHeight * ratio, cardHeight]);
        setFocused(type !== "mobile");
        setLoading(false);
      }
    }

    if (type === "mobile") setFocused(false);
  }, [cardHeight, event.thumbnailSrc, setFocused, setLoading, type]);

  useEffect(() => {
    handleAdjustImageSize();
  }, [cardHeight, handleAdjustImageSize]);

  const handleWheelEvent = useCallback(
    (e: unknown) => {
      const we = e as WheelEvent;
      if (we.deltaY > 0) {
        setFocused(false);
      } else {
        setFocused(true);
      }
    },
    [setFocused]
  );

  useEffect(() => {
    if (imageRef.current && !listener.current) {
      imageRef.current.addEventListener("wheel", handleWheelEvent);
      listener.current = true;
    }
  }, [handleWheelEvent, imageRef]);

  const renderToggleThumbnail = useMemo(
    () => (
      <div
        className={clsx(
          "EventCardThumbnailToggle",
          "absolute mx-auto flex flex-col items-center z-10",
          "text-white hover:text-gray-200 cursor-pointer drop-shadow-md",
          focused
            ? "EventCardThumbnailToggleFocused"
            : "transition-all top-0 opacity-20 hover:opacity-100 hover:top-1"
        )}
        onClick={() => {
          setFocused((prev) => !prev);
        }}
      >
        <Icon
          className="!m-0"
          name={focused ? "chevron down" : "chevron up"}
          size="huge"
        />
        <span className={clsx("h-8", !focused && "hidden")}>
          Scroll down to continue
        </span>
      </div>
    ),
    [focused, setFocused]
  );

  return (
    <div
      className={clsx("EventCardHead relative")}
      style={
        mode === "view" && focused
          ? {
              height: `${cardHeight}px`,
            }
          : {
              height: "240px",
              minHeight: "240px",
            }
      }
      onClick={(e) => {
        e.stopPropagation();
        if (event.thumbnailSrc && type === "mobile")
          Object.assign(document.createElement("a"), {
            target: "_blank",
            rel: "noopener noreferrer",
            href: thumbnailURL,
          }).click();
      }}
    >
      <EventThumbnail
        imageRef={imageRef}
        className="!absolute !left-0 !top-0"
        type="banner"
        src={thumbnailURL}
        screenType={type}
        size={imageSize}
        footer={
          type !== "mobile" &&
          mode === "view" &&
          event.thumbnailSrc &&
          renderToggleThumbnail
        }
      />
      <div
        className={clsx(
          focused && "hidden",
          "absolute w-full h-full",
          "opacity-40 from-zinc-900 to-zinc-500",
          "bg-gradient-to-t",
          "transition-all duration-200"
        )}
      ></div>
      <div
        className={clsx(
          focused && "invisible opacity-0",
          "absolute w-full h-full",
          "flex flex-col justify-between",
          "transition-all duration-200"
        )}
      >
        <div
          className={clsx("flex items-end justify-between h-full")}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {mode === "view" ? renderViewTabs : renderEditTabs}
        </div>
      </div>
    </div>
  );
}
