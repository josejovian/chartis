import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { UserPicture } from "@/components";
import { getTimeDifference } from "@/utils";
import { EVENT_UPDATE_TERM } from "@/consts";
import { EventUpdateNameType } from "@/types";

export interface EventUpdateProps {
  authorId: string;
  eventId: string;
  date: number;
  type: EventUpdateNameType;
  valueNew?: string;
  valuePrevious?: string;
  last?: boolean;
}

export function EventUpdate({
  authorId,
  date,
  type,
  valueNew,
  valuePrevious,
  last,
}: EventUpdateProps) {
  const renderIcon = useMemo(() => {
    switch (type) {
      case "update-description":
        return <Icon name="chat" />;
      case "update-location":
        return <Icon name="location arrow" />;
      case "update-end-date":
        return <Icon name="calendar" />;
      case "update-start-date":
        return <Icon name="calendar" />;
      case "update-organizer":
        return <Icon name="user" />;
      case "update-tags":
        return <Icon name="tags" />;
      case "update-title":
        return <Icon name="font" />;
    }
    return <></>;
  }, [type]);

  const entryText = useMemo(() => {
    const phrase =
      type === "update-description" ? (
        <span className="underline">description</span>
      ) : (
        <>
          <span className="underline">{EVENT_UPDATE_TERM[type]}</span> from{" "}
          <b className="line-through">{valuePrevious ?? "-"}</b> to{" "}
          <b>{valueNew ?? "-"}</b>
        </>
      );

    return type === "initial-post" ? (
      <>posted this event</>
    ) : (
      <>updated the {phrase}</>
    );
  }, [type, valueNew, valuePrevious]);

  return (
    <div className="flex h-16">
      <div
        className={clsx(
          "z-10 relative flex justify-center row-span-3 after:-z-2 text-white",
          !last && [
            "after:content-[''] after:absolute after:top-0 after:right-1/2",
            "after:h-full after:w-px after:translate-x-1/2 after:bg-slate-400",
          ]
        )}
      >
        <UserPicture fullName="Unknown User" />
      </div>
      <p className="pl-4 mt-1.5">
        {renderIcon} <b>{authorId}</b> {entryText}{" "}
        <span className="inline-block">{getTimeDifference(date)}</span>
      </p>
    </div>
  );
}
