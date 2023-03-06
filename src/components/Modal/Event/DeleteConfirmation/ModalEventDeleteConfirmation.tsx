import { StateObject } from "@/types";
import { useState } from "react";
import { Button, Dropdown, Modal } from "semantic-ui-react";

export interface ModalEventDeleteConfirmationProps {
  onDelete?: () => void;
  stateDeleting?: StateObject<boolean>;
}

export function ModalEventDeleteConfirmation({
  onDelete,
  stateDeleting,
}: ModalEventDeleteConfirmationProps) {
  const [open, setOpen] = useState(false);
  const deleting = stateDeleting && stateDeleting[0];

  return (
    <Modal
      className="ModifiedModal"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Dropdown.Item className="!text-red-400">Delete</Dropdown.Item>}
    >
      <Modal.Header>Are you sure?</Modal.Header>
      <Modal.Content image>
        <Modal.Description>
          <p>
            Are you sure you want to delete this event? This cannot be undone
            later.
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-4">
        <Button color="black" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button color="yellow" onClick={onDelete} loading={deleting}>
          Delete
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
