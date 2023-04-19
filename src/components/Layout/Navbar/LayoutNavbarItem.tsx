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
}

export function LayoutNavbarItem({
  name,
  icon,
  href,
  onClick,
  active,
}: LayoutNavbarItemProps) {
  const renderItem = useMemo(
    () => (
      <div
        className={clsx(
          "h-8",
          "flex items-center",
          active
            ? [
                "text-primary-3 bg-slate-800 hover:bg-slate-700",
                "border-l border-l-4 border-primary-3",
                // eslint-disable-next-line no-mixed-spaces-and-tabs
              ]
            : ["!text-gray-50 hover:bg-slate-700", "cursor-pointer"]
        )}
        onClick={onClick}
      >
        <span className="ml-4">
          <Icon name={icon} />
        </span>
        <span className="ml-2">{name}</span>
      </div>
    ),
    [active, icon, name, onClick]
  );

  return href ? <Link href={href}>{renderItem}</Link> : renderItem;
}
