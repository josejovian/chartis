import { ReactNode } from "react";
import clsx from "clsx";

export interface ModalProps {
  content: ReactNode;
}

export function Modal({ content }: ModalProps) {
  return content ? (
    <div className={clsx(MODAL_WRAPPER_BASE_STYLE)} style={{ width: "800px" }}>
      {content}
    </div>
  ) : (
    <></>
  );
}

const MODAL_WRAPPER_BASE_STYLE = clsx(
  "fixed flex flex-col",
  "bg-white z-40 rounded-lg overflow-hidden"
);
