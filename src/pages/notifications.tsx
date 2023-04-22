import { useRouter } from "next/router";
import { LayoutTemplateCard, PageNotificationsCard } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export default function Notification() {
  const router = useRouter();
  const { type } = useScreen();

  return (
    <LayoutTemplateCard
      title="Notifications"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      <PageNotificationsCard className="!bg-sky-50" />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
