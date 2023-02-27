import { useMemo } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { EventModeType, EventType, StateObject } from "@/types";

export interface PageViewEventFootProps {
  event: EventType;
  stateMode: StateObject<EventModeType>;
  onSubmit?: () => void;
}

export function PageViewEventFoot({
  stateMode,
  onSubmit,
}: PageViewEventFootProps) {
  const mode = stateMode[0];

  const renderEdit = useMemo(
    () => (
      <div className={FOOT_STYLE}>
        <Button>Cancel</Button>
        <Button color="yellow" type="submit" onClick={onSubmit}>
          Save
        </Button>
      </div>
    ),
    [onSubmit]
  );

  const renderCreate = useMemo(
    () => (
      <div className={FOOT_STYLE}>
        <Button color="yellow" type="submit" onClick={onSubmit}>
          Create
        </Button>
      </div>
    ),
    [onSubmit]
  );

  return (
    <>
      {mode === "edit" && renderEdit}
      {mode === "create" && renderCreate}
    </>
  );
}

const FOOT_STYLE = clsx(
  "relative h-16 py-2 px-4",
  "flex items-center justify-end gap-4",
  "border-t border-secondary-2"
);
