/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from "react";
import { Field } from "formik";
import { Dropdown, Input, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import {
  EventTags,
  FormErrorMessage,
  PageViewEventCardDetail,
} from "@/components";
import { strDateTime } from "@/utils";
import { EVENT_TAGS } from "@/consts";
import {
  EventDetailType,
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";

export interface PageViewEventBodyProps {
  event: EventType;
  mode: EventModeType;
  stateTags: StateObject<number[]>;
  type: ScreenSizeCategoryType;
  validateForm?: () => void;
}

export function PageViewEventBody({
  event,
  mode,
  stateTags,
  validateForm,
}: PageViewEventBodyProps) {
  const { location, authorId, organizer, startDate, endDate, description } =
    event;
  const [tags, setTags] = stateTags;

  const renderEventTags = useMemo(
    () => (
      <div className="flex gap-2">
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
    (values: string[]) => {
      setTags(values ? values.map((value) => Number(value)) : []);
      setTimeout(() => {
        validateForm && validateForm();
      }, 100);
    },
    [setTags, validateForm]
  );

  const renderEditEventTags = useMemo(
    () => (
      <>
        <Dropdown
          placeholder="Enter event tags"
          className="!border-0 !min-h-0 !py-0"
          fluid
          search
          selection
          multiple
          transparent
          defaultValue={tags}
          onChange={(_, { value }) => handleUpdateTagJSON(value as string[])}
          onMouseDown={() => validateForm && validateForm()}
          onBlur={() => validateForm && validateForm()}
          options={EVENT_TAGS.map(({ name }, idx) => ({
            key: `SelectTag_${name}`,
            text: name,
            value: idx,
          }))}
        />
        <Field name="tags">
          {({ field, meta }: any) => (
            <div className="">
              <Input
                className="EventInput !hidden"
                size="big"
                transparent
                {...field}
              />
              <FormErrorMessage meta={meta} className="!z-10" overlap />
            </div>
          )}
        </Field>
      </>
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
        rawValue: startDate,
        moddedValue: startDate && strDateTime(new Date(startDate)),
        inputType: "datetime-local",
      },
      {
        icon: "calendar",
        id: "endDate",
        name: "END",
        rawValue: endDate,
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

  const renderEventCreators = useMemo(
    /** @todo Replace authorId with real username. */
    () =>
      mode === "view" && (
        <span className="text-14px text-secondary-4">
          Posted by <b>{authorId}</b> a week ago
        </span>
      ),
    [authorId, mode]
  );

  const renderEventName = useMemo(
    () =>
      mode === "view" ? (
        <h2 className="h2 text-secondary-7">{event.name}</h2>
      ) : (
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
              <FormErrorMessage meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [event.name, mode]
  );

  const renderEventDetails = useMemo(
    () => <PageViewEventCardDetail details={details} mode={mode} />,
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
              <FormErrorMessage meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [description, mode]
  );

  const renderEventCardContent = useMemo(
    () => (
      <>
        {renderEventCreators}
        {renderEventName}
        {renderEventDetails}
        {renderEventDescription}
      </>
    ),
    [
      renderEventCreators,
      renderEventDescription,
      renderEventDetails,
      renderEventName,
    ]
  );

  return (
    <div
      className={clsx(
        EVENT_CARD_BODY_WRAPPER_STYLE,
        mode !== "view" && "ui form div !h-full"
      )}
    >
      {renderEventCardContent}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-4 pb-6 overflow-y-auto";
