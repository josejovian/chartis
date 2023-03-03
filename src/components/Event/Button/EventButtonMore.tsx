import { useMemo } from "react";
import { Button, Dropdown, Icon, SemanticSIZES } from "semantic-ui-react";
import clsx from "clsx";
import { EventType, StateObject, IdentificationType } from "@/types";
import { ModalEventDeleteConfirmation } from "@/components/Modal";

export interface EventButtonMoreProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  stateDeleting?: StateObject<boolean>;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
}

export function EventButtonMore({
  event,
  identification,
  size,
  stateDeleting,
  onDelete,
  onEdit,
  onReport,
}: EventButtonMoreProps) {
  const { authorId } = event;
  const { permission, user } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.uid === authorId),
    [authorId, user]
  );

  const renderDropdownItems = useMemo(() => {
    if (permission === "admin")
      return (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          <Dropdown.Item>Hide</Dropdown.Item>
          <ModalEventDeleteConfirmation
            onDelete={onDelete}
            stateDeleting={stateDeleting}
          />
        </>
      );
    if (isAuthor)
      return (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          <ModalEventDeleteConfirmation
            onDelete={onDelete}
            stateDeleting={stateDeleting}
          />
        </>
      );
    return <Dropdown.Item onClick={onReport}>Report</Dropdown.Item>;
  }, [isAuthor, onDelete, onEdit, onReport, permission, stateDeleting]);

  return (
    <div
      className={clsx(permission === "guest" && "hidden")}
      style={{
        zIndex: 15,
      }}
    >
      {permission !== "guest" && (
        <Dropdown
          icon={<></>}
          className="icon"
          direction="left"
          floating
          trigger={
            <Button className="!m-0" icon size={size}>
              <Icon name="ellipsis vertical" />
            </Button>
          }
        >
          <Dropdown.Menu>
            <Dropdown.Menu scrolling>{renderDropdownItems}</Dropdown.Menu>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
}
