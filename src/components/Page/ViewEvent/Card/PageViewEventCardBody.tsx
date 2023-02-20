import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { EventTags } from "@/components";
import { strDateTime } from "@/utils";
import { EventDetailType, EventType, ScreenSizeCategoryType } from "@/types";

export interface PageViewEventBodyProps {
  event: EventType;
  type: ScreenSizeCategoryType;
}

export function PageViewEventBody({ event, type }: PageViewEventBodyProps) {
  const { location, authorId, organizer, startDate, endDate } = event;

  const renderEventTags = useMemo(
    () => (
      <div className="flex gap-2">
        <EventTags event={event} type="EventCardDetail" size="tiny" />
      </div>
    ),
    [event]
  );

  const details = useMemo<EventDetailType[]>(
    () => [
      {
        icon: "tags",
        name: "TAGS",
        value: renderEventTags,
      },
      { icon: "group", name: "ORGANIZER", value: organizer },
      { icon: "location arrow", name: "LOCATION", value: location },
      {
        icon: "calendar",
        name: "START",
        value: startDate && strDateTime(new Date(startDate)),
      },
      {
        icon: "calendar",
        name: "END",
        value: endDate && strDateTime(new Date(endDate)),
      },
    ],
    [endDate, location, organizer, renderEventTags, startDate]
  );

  const renderEventCreators = useMemo(
    /** @todo Replace authorId with real username. */
    () => (
      <span className="text-14px text-secondary-4">
        Posted by <b>{authorId}</b> a week ago{" "}
        {organizer &&
          `- Organized by
				<b>${organizer}</b>`}
      </span>
    ),
    [authorId, organizer]
  );

  const renderEventName = useMemo(
    () => <h2 className="text-secondary-7">{event.name}</h2>,
    [event.name]
  );

  const renderEventDetails = useMemo(
    () => (
      <table className="border-collapse mt-4">
        <tbody>
          {details.map(({ icon, name, value }) => (
            <tr key={`ModalViewEventBody_Detail-${name}`}>
              <th className={clsx(DETAIL_CELL_BASE_STYLE, "w-fit")}>
                <div className="!w-fit flex gap-1 text-slate-500">
                  <Icon name={icon} />
                  <span>{name}</span>
                </div>
              </th>
              <td className={clsx(DETAIL_CELL_BASE_STYLE, "w-full")}>
                {value ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    [details]
  );

  const renderEventDescription = useMemo(
    () => (
      <p className="mt-8">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel a
        repudiandae debitis numquam, omnis deserunt reprehenderit aperiam nemo
        similique voluptate accusantium ab vitae aliquid pariatur quis
        distinctio expedita labore enim. Lorem ipsum dolor sit, amet consectetur
        adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
        reprehenderit aperiam nemo similique voluptate accusantium ab vitae
        aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum dolor
        sit, amet consectetur adipisicing elit. Vel a repudiandae debitis
        numquam, omnis deserunt reprehenderit aperiam nemo similique voluptate
        accusantium ab vitae aliquid pariatur quis distinctio expedita labore
        enim. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel a
        repudiandae debitis numquam, omnis deserunt reprehenderit aperiam nemo
        similique voluptate accusantium ab vitae aliquid pariatur quis
        distinctio expedita labore enim. Lorem ipsum dolor sit, amet consectetur
        adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
        reprehenderit aperiam nemo similique voluptate accusantium ab vitae
        aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum dolor
        sit, amet consectetur adipisicing elit. Vel a repudiandae debitis
        numquam, omnis deserunt reprehenderit aperiam nemo similique voluptate
        accusantium ab vitae aliquid pariatur quis distinctio expedita labore
        enim. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel a
        repudiandae debitis numquam, omnis deserunt reprehenderit aperiam nemo
        similique voluptate accusantium ab vitae aliquid pariatur quis
        distinctio expedita labore enim. Lorem ipsum dolor sit, amet consectetur
        adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
        reprehenderit aperiam nemo similique voluptate accusantium ab vitae
        aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum dolor
        sit, amet consectetur adipisicing elit. Vel a repudiandae debitis
        numquam, omnis deserunt reprehenderit aperiam nemo similique voluptate
        accusantium ab vitae aliquid pariatur quis distinctio expedita labore
        enim. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel a
        repudiandae debitis numquam, omnis deserunt reprehenderit aperiam nemo
        similique voluptate accusantium ab vitae aliquid pariatur quis
        distinctio expedita labore enim. Lorem ipsum dolor sit, amet consectetur
        adipisicing elit. Vel a repudiandae debitis numquam, omnis deserunt
        reprehenderit aperiam nemo similique voluptate accusantium ab vitae
        aliquid pariatur quis distinctio expedita labore enim. Lorem ipsum dolor
        sit, amet consectetur adipisicing elit. Vel a repudiandae debitis
        numquam, omnis deserunt reprehenderit aperiam nemo similique voluptate
        accusantium ab vitae aliquid pariatur quis distinctio expedita labore
        enim.
      </p>
    ),
    []
  );

  return (
    <div className={clsx("px-12 pt-4 pb-6 overflow-y-scroll")}>
      {renderEventCreators}
      {renderEventName}
      {renderEventDetails}
      {renderEventDescription}
    </div>
  );
}

const DETAIL_CELL_BASE_STYLE =
  "pl-3 pr-4 h-8 text-14px border border-secondary-3";
