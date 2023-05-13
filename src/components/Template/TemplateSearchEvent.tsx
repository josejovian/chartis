import { useRouter } from "next/router";
import { LayoutTemplateCard, PageSearchEventCard } from "@/components";
import { EventSearchType, ResponsiveStyleType } from "@/types";
import { useScreen } from "@/hooks";
import clsx from "clsx";
import { useMemo } from "react";

export interface TemplateSearchEventProps {
  noWrapper?: boolean;
  className?: string;
  viewType?: EventSearchType;
  title: string;
}

export function TemplateSearchEvent({
  noWrapper,
  className,
  viewType,
  title,
}: TemplateSearchEventProps) {
  const router = useRouter();
  const { type } = useScreen();

  const renderSearcher = useMemo(
    () => (
      <PageSearchEventCard
        className={clsx(
          "PageSearchEventCard !bg-sky-50 p-4 !pb-0 !h-full",
          className
        )}
        viewType={viewType ?? "default"}
        type={type}
      />
    ),
    [className, type, viewType]
  );

  return noWrapper ? (
    renderSearcher
  ) : (
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
      {renderSearcher}
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10 !pb-0",
  desktop_sm: "!px-10 !pb-0",
  mobile: "",
};
