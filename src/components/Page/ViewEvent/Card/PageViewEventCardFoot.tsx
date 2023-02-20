import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { EventType, StateObject } from "@/types";

export interface PageViewEventFootProps {
  event: EventType;
  stateEdit: StateObject<boolean>;
}

export function PageViewEventFoot({ stateEdit }: PageViewEventFootProps) {
  const edit = stateEdit[0];

  return (
    <>
      {edit && (
        <div
          className={clsx(
            "relative h-16 py-2 px-4",
            "flex items-center justify-end gap-4",
            "border-t border-secondary-2"
          )}
        >
          <Button>Cancel</Button>
          <Button color="green">Save</Button>
        </div>
      )}
    </>
  );
}
