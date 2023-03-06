import { useState } from "react";
import { Button, Modal } from "semantic-ui-react";

export interface ModalEventLeaveEditConfirmationProps {
  onLeaveEdit?: () => void;
}

export function ModalEventLeaveEditConfirmation({
  onLeaveEdit,
}: ModalEventLeaveEditConfirmationProps) {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      className="ModifiedModal"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button>Cancel</Button>}
    >
      <Modal.Header>Are you sure?</Modal.Header>
      <Modal.Content image>
        <Modal.Description>
          <p>
            Are you sure you want to leave making changes? The changes will not
            be saved.
          </p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-4">
        <Button color="black" onClick={() => setOpen(false)}>
          Stay
        </Button>
        <Button color="yellow" onClick={onLeaveEdit}>
          Leave
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
