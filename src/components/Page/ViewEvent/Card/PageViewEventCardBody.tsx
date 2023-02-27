/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Field } from "formik";
import { Dropdown, Icon, Input, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import { EventTags, PageViewEventCardDetailEditor } from "@/components";
import { strDateTime } from "@/utils";
import {
  EventDetailType,
  EventDetailUnionType,
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
} from "@/types";
import { EVENT_TAGS } from "@/consts";

export interface PageViewEventBodyProps {
  event: EventType;
  mode: EventModeType;
  type: ScreenSizeCategoryType;
}

export function PageViewEventBody({ event, mode }: PageViewEventBodyProps) {
  const { location, authorId, organizer, startDate, endDate } = event;

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

  const renderEditEventTags = useMemo(
    () => (
      <Dropdown
        placeholder="Enter event tags"
        className="!border-0 !min-h-0 !py-0"
        fluid
        multiple
        search
        selection
        transparent
        options={EVENT_TAGS.map(({ name }) => ({
          key: `SelectTag_${name}`,
          text: name,
          value: name,
        }))}
      />
    ),
    []
  );

  const details = useMemo<EventDetailType[]>(
    () => [
      {
        icon: "tags",
        name: "TAGS",
        viewElement: renderEventTags,
        editElement: renderEditEventTags,
      },
      {
        icon: "group",
        name: "ORGANIZER",
        rawValue: organizer,
        inputType: "text",
        placeholder: "Enter event organizer",
      },
      {
        icon: "location arrow",
        name: "LOCATION",
        rawValue: location,
        inputType: "text",
        placeholder: "Enter event location",
      },
      {
        icon: "calendar",
        name: "START",
        rawValue: startDate && strDateTime(new Date(startDate)),
        inputType: "datetime-local",
      },
      {
        icon: "calendar",
        name: "END",
        rawValue: endDate && strDateTime(new Date(endDate)),
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
          Posted by <b>{authorId}</b> a week ago{" "}
          {organizer &&
            `- Organized by
				<b>${organizer}</b>`}
        </span>
      ),
    [authorId, mode, organizer]
  );

  const renderEventName = useMemo(
    () =>
      mode === "view" ? (
        <h2 className="h2 text-secondary-7">{event.name}</h2>
      ) : (
        <Field name="name">
          {({ field }: any) => (
            <Input
              className="w-full font-bold !text-red-100 !font-bold !h-8 !border-0"
              style={{ fontSize: "1.5rem", marginTop: "20px" }}
              size="big"
              placeholder="Enter event name"
              transparent
              {...field}
            />
          )}
        </Field>
      ),
    [event.name, mode]
  );

  const renderEventDetails = useMemo(
    () => (
      <table className="EventDetailsTable border-collapse mt-4">
        <tbody>
          {details.map((detail) => {
            const {
              name,
              icon,
              editElement,
              rawValue,
              viewElement,
              placeholder,
              inputType,
            } = detail as EventDetailUnionType;

            return (
              <tr
                key={`ModalViewEventBody_Detail-${name}`}
                style={{
                  height: "31px",
                  maxHeight: "31px",
                }}
              >
                <th
                  className={clsx(DETAIL_CELL_BASE_STYLE, "w-fit")}
                  style={{
                    height: "31px",
                    maxHeight: "31px",
                  }}
                >
                  <div className="!w-fit flex gap-1 text-slate-500">
                    <Icon name={icon} />
                    <span>{name}</span>
                  </div>
                </th>
                <td
                  className={clsx(
                    DETAIL_CELL_BASE_STYLE,
                    "w-full",
                    mode !== "view" && "!p-0",
                    mode !== "view" && "hover:!bg-secondary-1"
                  )}
                  style={{
                    maxHeight: "32px",
                  }}
                >
                  {mode === "view" ? (
                    viewElement || rawValue || "-"
                  ) : editElement ? (
                    editElement
                  ) : (
                    <PageViewEventCardDetailEditor
                      defaultValues={rawValue}
                      placeholder={placeholder}
                      type={inputType}
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ),
    [details, mode]
  );

  const renderEventDescription = useMemo(
    () =>
      mode === "view" ? (
        <p className="mt-8">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel a
          repudiandae debitis numquam, omnis deserunt reprehenderit aperiam nemo
          similique voluptate accusantium ab vitae aliquid pariatur quis
          distinctio expedita labore enim. Lorem ipsum dolor sit, amet
          consectetur adipisicing elit. Vel a repudiandae debitis numquam, omnis
          deserunt reprehenderit aperiam nemo similique voluptate accusantium ab
          vitae aliquid pariatur quis distinctio expedita labore enim. Lorem
          ipsum dolor sit, amet consectetur adipisicing elit. Vel a repudiandae
          debitis numquam, omnis deserunt reprehenderit aperiam nemo similique
          voluptate accusantium ab vitae aliquid pariatur quis distinctio
          expedita labore enim. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
          reprehenderit aperiam nemo similique voluptate accusantium ab vitae
          aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum
          dolor sit, amet consectetur adipisicing elit. Vel a repudiandae
          debitis numquam, omnis deserunt reprehenderit aperiam nemo similique
          voluptate accusantium ab vitae aliquid pariatur quis distinctio
          expedita labore enim. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
          reprehenderit aperiam nemo similique voluptate accusantium ab vitae
          aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum
          dolor sit, amet consectetur adipisicing elit. Vel a repudiandae
          debitis numquam, omnis deserunt reprehenderit aperiam nemo similique
          voluptate accusantium ab vitae aliquid pariatur quis distinctio
          expedita labore enim. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
          reprehenderit aperiam nemo similique voluptate accusantium ab vitae
          aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum
          dolor sit, amet consectetur adipisicing elit. Vel a repudiandae
          debitis numquam, omnis deserunt reprehenderit aperiam nemo similique
          voluptate accusantium ab vitae aliquid pariatur quis distinctio
          expedita labore enim. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
          reprehenderit aperiam nemo similique voluptate accusantium ab vitae
          aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum
          dolor sit, amet consectetur adipisicing elit. Vel a repudiandae
          debitis numquam, omnis deserunt reprehenderit aperiam nemo similique
          voluptate accusantium ab vitae aliquid pariatur quis distinctio
          expedita labore enim. Lorem ipsum dolor sit, amet consectetur
          adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
          reprehenderit aperiam nemo similique voluptate accusantium ab vitae
          aliquid pariatur quis distinctio expedita labore enim.
        </p>
      ) : (
        <Field name="description">
          {({ field }: any) => (
            <div>
              <TextArea
                className="!mt-8 !p-0 !b-0 !text-14px hover:bg-secondary-1"
                transparent
                style={{
                  resize: "none",
                  lineHeight: "1.25rem",
                  border: "0!important",
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = "0";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder="Enter event description"
                {...field}
              />
            </div>
          )}
        </Field>
      ),
    [mode]
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

const DETAIL_CELL_BASE_STYLE = "pl-3 pr-4 text-14px border border-secondary-3";

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-4 pb-6 overflow-y-scroll";
