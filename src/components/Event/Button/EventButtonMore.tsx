import { useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EventType, StateObject, IdentificationType } from "@/types";
import { ModalConfirmation } from "@/components/Modal";

export interface EventButtonMoreProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  stateModalDelete: StateObject<boolean>;
  stateDeleting?: StateObject<boolean>;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
}

export function EventButtonMore({
  event,
  identification,
  size,
  stateModalDelete,
  stateDeleting,
  onDelete,
  onEdit,
  onReport,
}: EventButtonMoreProps) {
  const [open, setOpen] = useState(false);
  const { authorId } = event;
  const { permission, user } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.uid === authorId),
    [authorId, user]
  );

  const modalDelete = useMemo(
    () => (
      <ModalConfirmation
        trigger={<Dropdown.Item className="!bg-red-400">Delete</Dropdown.Item>}
        onConfirm={onDelete}
        stateOpen={stateModalDelete}
        stateLoading={stateDeleting}
        modalText="Are you sure you want to delete this event? This cannot be undone later."
        confirmText="Delete"
      />
    ),
    [onDelete, stateDeleting, stateModalDelete]
  );

  const renderDropdownItems = useMemo(() => {
    if (permission === "admin")
      return (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          <Dropdown.Item>Hide</Dropdown.Item>
          {modalDelete}
        </>
      );
    if (isAuthor)
      return (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          {modalDelete}
        </>
      );
    return <Dropdown.Item onClick={onReport}>Report</Dropdown.Item>;
  }, [isAuthor, modalDelete, onEdit, onReport, permission]);

  return (
    <div
      className={clsx("!relative", permission === "guest" && "hidden")}
      style={{}}
    >
      {permission !== "guest" && (
        <Dropdown
          icon={<></>}
          className={clsx("icon", open && "z-16 relative")}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          direction="left"
          floating
          trigger={
            <Button className="!m-0 !z-10 relative" icon size={size}>
              <Icon name="ellipsis vertical" />
            </Button>
          }
        >
          <Dropdown.Menu className="!absolute">
            <Dropdown.Menu scrolling>{renderDropdownItems}</Dropdown.Menu>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}
