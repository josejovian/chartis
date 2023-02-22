import clsx from "clsx";
import { LayoutTemplate, LayoutTemplateProps } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

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
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type],
        classNameMain
      )}
      {...rest}
    >
      {children}
    </LayoutTemplate>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-40",
  desktop_sm: "!px-40",
  mobile: "",
};
