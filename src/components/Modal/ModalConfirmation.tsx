import { ReactNode, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { StateObject } from "@/types";

export interface ConfirmationModalProps {
  trigger: ReactNode;
  onConfirm?: () => void;
  stateOpen?: StateObject<boolean>;
  stateLoading?: StateObject<boolean>;
  modalHeader?: string;
  modalText?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ModalConfirmation({
  trigger,
  onConfirm,
  stateOpen,
  stateLoading,
  modalHeader = "Are you sure?",
  modalText = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) {
  const stateSelf = useState(false);
  const [open, setOpen] = stateOpen ?? stateSelf;
  const loading = stateLoading && stateLoading[0];

  return (
    <Modal
      className="ModifiedModal"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={trigger}
    >
      <Modal.Header>{modalHeader}</Modal.Header>
      <Modal.Content image>
        <Modal.Description>
          <p>{modalText}</p>
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-4">
        <Button color="black" onClick={() => setOpen(false)}>
          {cancelText}
        </Button>
        <Button
          color="yellow"
          onClick={onConfirm}
          loading={loading ? loading : false}
        >
          {confirmText}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
