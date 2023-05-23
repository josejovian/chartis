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
  userId?: string;
}

export function TemplateSearchEvent({
  noWrapper,
  className,
  viewType,
  title,
  userId,
}: TemplateSearchEventProps) {
  const router = useRouter();
  const { type } = useScreen();

  const renderSearcher = useMemo(
    () => (
      <PageSearchEventCard
        className={clsx(
          "PageSearchEventCard !bg-sky-50 !pb-0 !h-full",
          !noWrapper && "p-4",
          className
        )}
        userId={userId}
        viewType={viewType ?? "default"}
        type={type}
        noWrapper
      />
    ),
    [className, noWrapper, type, userId, viewType]
  );

  return noWrapper ? (
    renderSearcher
  ) : (
    <LayoutTemplateCard
      title={title}
      htmlTitle={title}
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
