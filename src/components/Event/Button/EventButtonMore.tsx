import { useCallback, useMemo, useState } from "react";
import { Button, Dropdown, Icon, type SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EventType, StateObject, IdentificationType } from "@/types";
import { ModalConfirmation } from "@/components/Modal";
import { FIREBASE_COLLECTION_EVENTS } from "@/consts";
import { useToast } from "@/hooks";
import { updateData } from "@/utils";

export interface EventButtonMoreProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  stateModalDelete: StateObject<boolean>;
  stateDeleting?: StateObject<boolean>;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
  updateClientSideEvent: (eventId: string, event: Partial<EventType>) => void;
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
  updateClientSideEvent,
}: EventButtonMoreProps) {
  const deleting = stateDeleting && stateDeleting[0];
  const [open, setOpen] = useState(false);
  const { id, authorId, hide } = event;
  const { user } = identification;
  const { addToast } = useToast();

  const isAuthor = useMemo(
    () => Boolean(user && user.id === authorId),
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
    if (!id) return;

    updateData(FIREBASE_COLLECTION_EVENTS, id, {
      hide: !hide,
    }).then(() => {
      addToast({
        title: `Success`,
        description: `Event is now ${!hide ? "hidden" : "visible"}`,
        variant: "success",
      });

      updateClientSideEvent(id, {
        hide: !hide,
      });
    });
  }, [addToast, hide, id, updateClientSideEvent]);

  const renderDropdownItems = useMemo(() => {
    if (isAuthor)
      return (
        <>
          <Dropdown.Item onClick={handleHideEvent}>
            {event.hide ? "Unhide" : "Hide"}
          </Dropdown.Item>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          {modalDelete}
        </>
      );

    if (user?.role === "admin")
      return (
        <>
          <Dropdown.Item onClick={handleHideEvent}>
            {event.hide ? "Unhide" : "Hide"}
          </Dropdown.Item>
          <Dropdown.Item onClick={onReport} disabled={user?.ban}>
            Report
          </Dropdown.Item>
        </>
      );
    return (
      <Dropdown.Item onClick={onReport} disabled={user?.ban}>
        Report
      </Dropdown.Item>
    );
  }, [
    event.hide,
    handleHideEvent,
    isAuthor,
    modalDelete,
    onEdit,
    onReport,
    user?.ban,
    user?.role,
  ]);

  return (
    <div className={clsx("!relative")} style={{}}>
      {user && (
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
