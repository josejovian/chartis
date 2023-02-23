import clsx from "clsx";
import { LayoutTemplate, LayoutTemplateProps } from "@/components";
import { useScreen } from "@/hooks";

export function LayoutTemplateCard({
  classNameMain,
  children,
  ...rest
}: LayoutTemplateProps) {
  const { type } = useScreen();

  return (
    <LayoutTemplate
      classNameMain={clsx(
        "justify-center",
        type !== "mobile" && "py-12",
        classNameMain
      )}
      {...rest}
    >
      {children}
    </LayoutTemplate>
  );
}
