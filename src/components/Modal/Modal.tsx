import { ReactNode } from "react";
import clsx from "clsx";
import { ResponsiveInlineStyleType, ResponsiveStyleType } from "@/types";
import { useScreen } from "@/hooks";

export interface ModalProps {
  content: ReactNode;
}

export function Modal({ content }: ModalProps) {
  const { type } = useScreen();

  return content ? (
    <div
      className={clsx(MODAL_WRAPPER_RESPONSIVE_STYLE[type])}
      style={MODAL_WRAPPER_RESPONSIVE_INLINE_STYLE[type]}
    >
      {content}
    </div>
  ) : (
    <></>
  );
}

const MODAL_WRAPPER_BASE_STYLE = clsx(
  "fixed flex flex-col p-8",
  "bg-white z-40 overflow-hidden"
);

const MODAL_WRAPPER_DESKTOP_STYLE = clsx(
  MODAL_WRAPPER_BASE_STYLE,
  "rounded-lg"
);

const MODAL_WRAPPER_MOBILE_STYLE = clsx(
  MODAL_WRAPPER_BASE_STYLE,
  "bottom-0 rounded-t-lg"
);

const MODAL_WRAPPER_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: MODAL_WRAPPER_DESKTOP_STYLE,
  desktop_sm: MODAL_WRAPPER_DESKTOP_STYLE,
  mobile: MODAL_WRAPPER_MOBILE_STYLE,
};

const MODAL_WRAPPER_RESPONSIVE_INLINE_STYLE: ResponsiveInlineStyleType = {
  desktop_lg: { width: "800px" },
  desktop_sm: { width: "800px" },
  mobile: { width: "100%" },
};
