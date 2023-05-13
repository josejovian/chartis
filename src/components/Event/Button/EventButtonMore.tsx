import { useCallback, useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EventType, StateObject, IdentificationType } from "@/types";
import { ModalConfirmation } from "@/components/Modal";
import { updateData } from "@/firebase";
import { FIREBASE_COLLECTION_EVENTS } from "@/consts";
import { useToast } from "@/hooks";

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
  const deleting = stateDeleting && stateDeleting[0];
  const [open, setOpen] = useState(false);
  const { authorId, hide } = event;
  const { user } = identification;
  const [eventIsHidden, setEventIsHidden] = useState(hide);
  const { addToast } = useToast();

  const isAuthor = useMemo(
    () => Boolean((user && user.id === authorId) || true),
    [authorId, user]
  );

  const modalDelete = useMemo(
    () => (
      <ModalConfirmation
        trigger={
          <Dropdown.Item className="!text-red-400">Delete</Dropdown.Item>
        }
        onConfirm={onDelete}
        stateOpen={stateModalDelete}
        loading={deleting}
        color="red"
        modalText="Are you sure you want to delete this event? This cannot be undone later."
        confirmText="Delete"
      />
    ),
    [deleting, onDelete, stateModalDelete]
  );

  const handleHideEvent = useCallback(async () => {
    if (!event.id) return;

    updateData(FIREBASE_COLLECTION_EVENTS, event.id, {
      hide: !hide,
    }).then(() => {
      setEventIsHidden((prev) => !prev);
      addToast({
        title: `Success`,
        description: `Event is now ${eventIsHidden ? "hidden" : "visible"}`,
        variant: "success",
      });
    });
  }, [addToast, event.id, eventIsHidden, hide]);

  const renderDropdownItems = useMemo(() => {
    if (user?.role === "admin")
      return (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          <Dropdown.Item onClick={handleHideEvent}>
            {eventIsHidden ? "Unhide" : "Hide"}
          </Dropdown.Item>
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
    return (
      <Dropdown.Item onClick={onReport} disabled={user?.ban}>
        Report
      </Dropdown.Item>
    );
  }, [
    eventIsHidden,
    handleHideEvent,
    isAuthor,
    modalDelete,
    onEdit,
    onReport,
    user,
  ]);

  return (
    <div className={clsx("!relative")} style={{}}>
      {(true || user) && (
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
