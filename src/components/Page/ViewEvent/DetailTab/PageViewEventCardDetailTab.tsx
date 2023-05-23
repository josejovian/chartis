/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo } from "react";
import { Field } from "formik";
import { Icon, Input, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventTags,
  FormErrorMessage,
  FormInputDropdown,
  ModalDateTimePick,
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
import { useModal } from "@/hooks";
import {
  VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH,
  VALIDATION_EVENT_DESCRIPTION_MIN_LENGTH,
} from "@/utils/form/const";

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
  const { setModal } = useModal();

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

  const handleEditDate = useCallback(
    (type: "start" | "end") => {
      setModal(
        <ModalDateTimePick
          type="datetime"
          defaultDate={type === "start" ? startDate : endDate}
          onSelectDate={(date) => {
            setFieldValue &&
              setFieldValue(
                type === "start" ? "startDate" : "endDate",
                date ? getLocalTimeInISO(date.getTime()) : undefined
              );
          }}
          hideToday
        />
      );
    },
    [endDate, setFieldValue, setModal, startDate]
  );

  const renderEventDate = useCallback(
    ({
      inputId,
      inputName,
      date,
      onClick,
    }: {
      inputId: string;
      inputName: string;
      date?: number;
      onClick?: () => void;
    }) => (
      <>
        <Field name={inputName}>
          {({ field, meta }: any) => {
            return (
              <div
                className="EventDetailsTableEntry relative flex items-center cursor-pointer !h-full"
                onClick={onClick}
              >
                <Input
                  id={inputId}
                  name={inputName}
                  className="!hidden"
                  type="datetime-local"
                  transparent
                  {...field}
                />
                {field.value ? strDateTime(new Date(field.value)) : "-"}
                {field.value && (
                  <div className="ml-4 text-secondary-5 hover:text-secondary-7">
                    <Icon
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        setFieldValue && setFieldValue(inputId, undefined);
                      }}
                      name="x"
                    />
                  </div>
                )}
                <FormErrorMessage
                  error={meta.error}
                  showError={
                    inputId === "startDate" ||
                    inputId === "endDate" ||
                    meta.touched
                  }
                  className="mt-2 !ml-0"
                  overlap
                />
              </div>
            );
          }}
        </Field>
      </>
    ),
    [setFieldValue]
  );

  const details = useMemo<EventDetailType[]>(
    () => [
      {
        icon: "tags",
        name: "TAGS",
        viewElement: renderEventTags,
        editElement: renderEditEventTags,
        required: true,
      },
      {
        icon: "group",
        id: "organizer",
        name: "ORGANIZER",
        shortName: "ORG",
        rawValue: organizer,
        inputType: "text",
        placeholder: "Enter event organizer",
      },
      {
        icon: "location arrow",
        id: "location",
        name: "LOCATION",
        shortName: "LOC",
        rawValue: location,
        inputType: "text",
        placeholder: "Enter event location",
      },
      {
        icon: "calendar",
        name: "START",
        viewElement: startDate && strDateTime(new Date(startDate)),
        editElement: renderEventDate({
          inputId: "startDate",
          inputName: "startDate",
          date: startDate,
          onClick: () => handleEditDate("start"),
        }),
        required: true,
      },
      {
        icon: "calendar",
        name: "END",
        viewElement: endDate && strDateTime(new Date(endDate)),
        editElement: renderEventDate({
          inputId: "endDate",
          inputName: "endDate",
          date: endDate,
          onClick: () => handleEditDate("end"),
        }),
      },
    ],
    [
      endDate,
      handleEditDate,
      location,
      organizer,
      renderEditEventTags,
      renderEventDate,
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
              <FormErrorMessage
                icon
                error={meta.error}
                showError={meta.error && meta.touched}
                className="mt-2"
              />
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
        type={type}
        mode={mode}
        className="!mt-0"
      />
    ),
    [details, mode, type]
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
                placeholder={`Enter event description (${VALIDATION_EVENT_DESCRIPTION_MIN_LENGTH} - ${VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH} characters long).`}
                {...field}
              />
              <FormErrorMessage
                icon
                error={meta.error}
                showError={meta.error && meta.touched}
                className="mt-2"
              />
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
