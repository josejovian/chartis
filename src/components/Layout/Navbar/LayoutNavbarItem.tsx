import { UserPermissionType } from "@/types";
import clsx from "clsx";
import Link from "next/link";
import { useMemo } from "react";
import { Icon, type SemanticICONS } from "semantic-ui-react";

export interface LayoutNavbarItemProps {
  name: string;
  icon: SemanticICONS;
  href?: string;
  onClick?: () => void;
  permission?: UserPermissionType;
  active?: boolean;
  hidden?: boolean;
  alert?: boolean;
}

export function LayoutNavbarItem({
  name,
  icon,
  href,
  onClick,
  active,
  alert,
}: LayoutNavbarItemProps) {
  const renderItem = useMemo(
    () => (
      <div
        className={clsx(
          "relative flex items-center h-8 border-l border-l-4",
          active
            ? [
                "text-primary-3 bg-slate-800 hover:bg-slate-700",
                "border-l border-l-4 border-primary-3",
              ]
            : [
                "!text-gray-50 hover:bg-slate-700 border-transparent",
                "cursor-pointer",
              ]
        )}
        onClick={onClick}
      >
        <span className="ml-4 relative">
          {alert ? (
            <Icon.Group>
              <Icon name={icon} />
              <Icon name="circle" color="red" corner="top right" />
            </Icon.Group>
          ) : (
            <Icon name={icon} />
          )}
        </span>
        <span className="ml-2">{name}</span>
      </div>
    ),
    [active, alert, icon, name, onClick]
  );

  return href ? <Link href={href}>{renderItem}</Link> : renderItem;
}
