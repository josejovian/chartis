import clsx from "clsx";
import { ReactNode } from "react";
import { Icon, SemanticICONS } from "semantic-ui-react";

export interface LayoutNavbarButtonProps {
  className?: string;
  children?: ReactNode;
  icon?: SemanticICONS;
  onClick: () => void;
}

export function LayoutNavbarButton({
  icon,
  className,
  onClick,
}: LayoutNavbarButtonProps) {
  return (
    <div
      className={clsx(
        "!w-8 !h-8 flex justify-center items-center !m-0",
        "rounded-md bg-slate-700 hover:bg-slate-600 active:bg-slate-500 focus:bg-slate-500",
        "cursor-pointer",
        className
      )}
      style={{ paddingBottom: "4px" }}
      onClick={onClick}
    >
      <Icon fitted name={icon} />
    </div>
  );
}
