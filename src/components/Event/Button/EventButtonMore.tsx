import { useMemo } from "react";
import { Button, Dropdown, Icon, SemanticSIZES } from "semantic-ui-react";

export interface EventButtonMoreProps {
  hasPermission?: boolean;
  size?: SemanticSIZES;
  onDelete?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
}

export function EventButtonMore({
  hasPermission = true,
  size,
  onDelete,
  onEdit,
  onReport,
}: EventButtonMoreProps) {
  const renderDropdownItems = useMemo(
    () =>
      hasPermission ? (
        <>
          <Dropdown.Item onClick={onEdit}>Edit</Dropdown.Item>
          <Dropdown.Item onClick={onDelete}>Delete</Dropdown.Item>
        </>
      ) : (
        <Dropdown.Item onClick={onReport}>Report</Dropdown.Item>
      ),
    [hasPermission, onDelete, onEdit, onReport]
  );

  return (
    <div
      style={{
        zIndex: 60,
      }}
    >
      <Dropdown
        icon
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
    </div>
  );
}
