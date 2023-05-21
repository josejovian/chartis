import { ReactNode, useState } from "react";
import { Button, Modal, type SemanticCOLORS } from "semantic-ui-react";
import { StateObject } from "@/types";

export interface ConfirmationModalProps {
  trigger: ReactNode;
  onConfirm?: () => void;
  stateOpen?: StateObject<boolean>;
  loading?: boolean;
  modalHeader?: string;
  modalText?: string;
  confirmText?: string;
  cancelText?: string;
  color?: SemanticCOLORS;
}

export function ModalConfirmation({
  trigger,
  onConfirm,
  stateOpen,
  loading = false,
  modalHeader = "Are you sure?",
  modalText = "Are you sure?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  color = "yellow",
}: ConfirmationModalProps) {
  const stateSelf = useState(false);
  const [open, setOpen] = stateOpen ?? stateSelf;

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
        <Button onClick={() => setOpen(false)} basic>
          {cancelText}
        </Button>
        <Button
          color={color}
          onClick={onConfirm}
          loading={loading ? loading : false}
        >
          {confirmText}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}
