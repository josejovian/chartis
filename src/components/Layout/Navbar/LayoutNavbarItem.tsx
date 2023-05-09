import clsx from "clsx";
import { Icon } from "semantic-ui-react";
import { LayoutNavbarItemProps } from "./LayoutNavbar";
import { useRouter } from "next/router";

export function LayoutNavbarItem({
  name,
  icon,
  href,
  onClick,
  active,
  alert,
}: LayoutNavbarItemProps) {
  const router = useRouter();
  return (
    <div
      className={clsx(
        "relative flex items-center h-8 border-l-4",
        active
          ? [
              "text-primary-3 bg-slate-800 hover:bg-slate-700",
              "border-l-4 border-primary-3",
            ]
          : [
              "!text-gray-50 hover:bg-slate-700 border-transparent",
              "cursor-pointer",
            ]
      )}
      onClick={() => {
        router.push(href);
        onClick && onClick();
      }}
    >
      <span className="ml-4 relative">
        <Icon.Group>
          <Icon name={icon} />
          {alert && <Icon name="circle" color="red" corner="top right" />}
        </Icon.Group>
      </span>
      <span className="ml-2">{name}</span>
    </div>
  );
}
