import clsx from "clsx";
import { LayoutTemplate, TemplatePageNotFound } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export default function Custom404() {
  const { type } = useScreen();

  return (
    <LayoutTemplate
      title=""
      htmlTitle="Not Found"
      classNameMain={clsx(
        "!bg-sky-50",
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]
      )}
    >
      <TemplatePageNotFound />
    </LayoutTemplate>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20 !py-12",
  desktop_sm: "!px-20 !py-12",
  mobile: "",
};
