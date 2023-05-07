import { useMemo } from "react";
import clsx from "clsx";
import { UserPicture } from "@/components";
import { getTimeDifference } from "@/utils";
import { EVENT_UPDATE_TERM } from "@/consts";
import { UpdateNameType } from "@/types";

export interface EventUpdateProps {
  authorId: string;
  eventId: string;
  date: number;
  type: UpdateNameType;
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
  const entryText = useMemo(() => {
    const phrase =
      type === "update-description" ? (
        <span className="underline">description</span>
      ) : (
        <>
          <b>{EVENT_UPDATE_TERM[type]}</b> from <b>{valuePrevious ?? "-"}</b> to{" "}
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
        <b>{authorId}</b> {entryText}{" "}
        <span className="inline-block">{getTimeDifference(date)}.</span>
      </p>
    </div>
  );
}
