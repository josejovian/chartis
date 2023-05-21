import { useMemo } from "react";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { EventModeType, EventType, StateObject } from "@/types";
import { ModalConfirmation } from "@/components/Modal";

export interface PageViewEventFootProps {
  event: EventType;
  stateSubmitting: StateObject<boolean>;
  stateMode: StateObject<EventModeType>;
  onLeaveEdit?: () => void;
  submitForm?: () => void;
}

export function PageViewEventFoot({
  stateSubmitting,
  stateMode,
  onLeaveEdit,
  submitForm,
}: PageViewEventFootProps) {
  const mode = stateMode[0];
  const submitting = stateSubmitting[0];

  const renderEdit = useMemo(
    () => (
      <div className={FOOT_STYLE}>
        <ModalConfirmation
          trigger={<Button basic>Cancel</Button>}
          onConfirm={onLeaveEdit}
          modalText="Are you sure you want to leave making changes? The changes will not be saved."
          confirmText="Leave"
          cancelText="Stay"
        />
        <Button
          color="yellow"
          type="submit"
          onClick={submitForm}
          loading={submitting}
        >
          Update
        </Button>
      </div>
    ),
    [onLeaveEdit, submitForm, submitting]
  );

  const renderCreate = useMemo(
    () => (
      <div className={FOOT_STYLE}>
        <Button
          color="yellow"
          type="submit"
          onClick={submitForm}
          loading={submitting}
        >
          Create
        </Button>
      </div>
    ),
    [submitting, submitForm]
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
