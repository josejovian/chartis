import { useRouter } from "next/router";
import { LayoutTemplateCard, PageNotificationsCard } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";
import clsx from "clsx";

export default function Notification() {
  const router = useRouter();
  const { type } = useScreen();

  return (
    <LayoutTemplateCard
      title="Updates"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={clsx(
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type],
        "!pb-0"
      )}
    >
      <PageNotificationsCard
        className={clsx("!bg-sky-50 h-full", type === "mobile" && "pt-8")}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
