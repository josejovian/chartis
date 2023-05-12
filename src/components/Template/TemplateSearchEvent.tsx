import { useRouter } from "next/router";
import { LayoutTemplateCard, PageSearchEventCard } from "@/components";
import { EventSearchType, ResponsiveStyleType } from "@/types";
import { useScreen } from "@/hooks";

export interface TemplateSearchEventProps {
  viewType?: EventSearchType;
  title: string;
}

export function TemplateSearchEvent({
  viewType,
  title,
}: TemplateSearchEventProps) {
  const router = useRouter();
  const { type } = useScreen();

  return (
    <LayoutTemplateCard
      title={title}
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      <PageSearchEventCard
        className="PageSearchEventCard !bg-sky-50 p-4 !pb-0 !h-full"
        viewType={viewType ?? "default"}
        type={type}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10 !pb-0",
  desktop_sm: "!px-10 !pb-0",
  mobile: "",
};
