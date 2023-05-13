/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo } from "react";
import { Field } from "formik";
import { Input, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventTags,
  FormErrorMessage,
  FormInputDropdown,
  PageViewEventCardDetailTabDetail,
} from "@/components";
import { getLocalTimeInISO, strDateTime } from "@/utils";
import { EVENT_TAGS } from "@/consts";
import {
  EventDetailType,
  EventModeType,
  EventTagNameType,
  EventTagObjectType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";

export interface PageViewEventCardDetailTabProps {
  event: EventType;
  mode: EventModeType;
  stateTags: StateObject<EventTagObjectType>;
  type: ScreenSizeCategoryType;
  validateForm?: () => void;
  setFieldValue?: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
}

export function PageViewEventCardDetailTab({
  event,
  mode,
  type,
  stateTags,
  validateForm,
  setFieldValue,
}: PageViewEventCardDetailTabProps) {
  const { location, organizer, startDate, endDate, description } = event;
  const [tags, setTags] = stateTags;

  const renderEventTags = useMemo(
    () => (
      <div className="flex flex-wrap gap-2">
        <EventTags
          id={event.id}
          tags={event.tags}
          type="EventCardDetail"
          size="tiny"
        />
      </div>
    ),
    [event.id, event.tags]
  );

  const handleUpdateTagJSON = useCallback(
    (values: EventTagNameType[]) => {
      setTags(
        values.reduce(
          (prev, curr) => ({
            ...prev,
            [curr]: true,
          }),
          {}
        ) as Record<EventTagNameType, boolean>
      );
      setTimeout(() => {
        validateForm && validateForm();
      }, 100);
    },
    [setTags, validateForm]
  );

  const renderEditEventTags = useMemo(
    () => (
      <FormInputDropdown
        fieldName="tags"
        placeholder="Enter event tags"
        defaultValue={Object.keys(tags)}
        options={Object.entries(EVENT_TAGS).map(([id, { name }]) => ({
          key: `SelectTag_${id}`,
          text: name,
          value: id,
        }))}
        onChange={(_, { value }) =>
          handleUpdateTagJSON(value as EventTagNameType[])
        }
        validateForm={validateForm}
        formErrorMessageProps={{
          icon: true,
          overlap: true,
        }}
        multiple
      />
    ),
    [handleUpdateTagJSON, tags, validateForm]
  );

  const details = useMemo<EventDetailType[]>(
    () => [
      {
        icon: "tags",
        id: "tags",
        name: "TAGS",
        viewElement: renderEventTags,
        editElement: renderEditEventTags,
      },
      {
        icon: "group",
        id: "organizer",
        name: "ORGANIZER",
        rawValue: organizer,
        inputType: "text",
        placeholder: "Enter event organizer",
      },
      {
        icon: "location arrow",
        id: "location",
        name: "LOCATION",
        rawValue: location,
        inputType: "text",
        placeholder: "Enter event location",
      },
      {
        icon: "calendar",
        id: "startDate",
        name: "START",
        rawValue: undefined,
        moddedValue: strDateTime(new Date(startDate)),
        inputType: "datetime-local",
      },
      {
        icon: "calendar",
        id: "endDate",
        name: "END",
        rawValue: endDate ? getLocalTimeInISO(endDate) : undefined,
        moddedValue: endDate && strDateTime(new Date(endDate)),
        inputType: "datetime-local",
      },
    ],
    [
      endDate,
      location,
      organizer,
      renderEditEventTags,
      renderEventTags,
      startDate,
    ]
  );

  const renderEventName = useMemo(
    () =>
      mode !== "view" && (
        <Field name="name">
          {({ field, meta }: any) => (
            <div className="mt-5">
              <Input
                className="EventInput w-full font-bold !text-red-100 !font-bold !h-8 !border-0"
                style={{ fontSize: "1.5rem" }}
                size="big"
                placeholder="Enter event name"
                transparent
                {...field}
              />
              <FormErrorMessage icon meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [mode]
  );

  const renderEventDetails = useMemo(
    () => (
      <PageViewEventCardDetailTabDetail
        details={details}
        mode={mode}
        className="!mt-0"
      />
    ),
    [details, mode]
  );

  const renderEventDescription = useMemo(
    () =>
      mode === "view" ? (
        <pre className="mt-8">{description}</pre>
      ) : (
        <Field name="description">
          {({ field, meta }: any) => (
            <div className="mt-8">
              <TextArea
                className="EventInput !p-0 !b-0 !text-14px"
                transparent
                style={{
                  resize: "none",
                  lineHeight: "1.25rem",
                  minHeight: "4rem",
                  border: "0!important",
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = "0";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder="Enter event description (8 - 256 characters long)."
                {...field}
              />
              <FormErrorMessage icon meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [description, mode]
  );

  const renderEventCardContent = useMemo(
    () => (
      <div
        className={clsx(
          "overflow-y-auto !h-full px-12 py-6",
          type === "mobile" && "!px-6"
        )}
      >
        {renderEventName}
        {renderEventDetails}
        {renderEventDescription}
      </div>
    ),
    [renderEventDescription, renderEventDetails, renderEventName, type]
  );

  const handleUpdateDate = useCallback(() => {
    if (!setFieldValue) return;
    if (startDate) setFieldValue("startDate", getLocalTimeInISO(startDate));
    if (endDate) setFieldValue("endDate", getLocalTimeInISO(endDate));
  }, [endDate, setFieldValue, startDate]);

  useEffect(() => {
    handleUpdateDate();
  }, [startDate, endDate, handleUpdateDate]);

  return (
    <div
      className={clsx(
        "!flex !flex-col !h-0 !flex-auto",
        mode !== "view" && "ui form div"
      )}
    >
      {renderEventCardContent}
    </div>
  );
}
