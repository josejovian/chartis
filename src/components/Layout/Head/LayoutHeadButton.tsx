import { Icon, type SemanticICONS } from "semantic-ui-react";
import clsx from "clsx";
import { useScreen } from "@/hooks";
import {
  LAYOUT_HEAD_BUTTON_BASE_STYLE,
  LAYOUT_HEAD_BUTTON_DESKTOP_STYLE,
} from "@/components";

export interface LayoutHeadButtonProps {
  className?: string;
  icon: SemanticICONS;
  onClick: () => void;
}

export function LayoutHeadButton({
  className,
  icon,
  onClick,
}: LayoutHeadButtonProps) {
  const { type } = useScreen();
  return (
    <div
      className={clsx(
        LAYOUT_HEAD_BUTTON_BASE_STYLE,
        type !== "mobile" && LAYOUT_HEAD_BUTTON_DESKTOP_STYLE,
        className
      )}
      onClick={onClick}
    >
      <Icon name={icon} />
    </div>
  );
}
