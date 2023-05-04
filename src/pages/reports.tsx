import { useRouter } from "next/router";
import clsx from "clsx";
import { LayoutTemplateCard, PageManageReports } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export default function Notification() {
  const router = useRouter();
  const { type } = useScreen();

  return (
    <LayoutTemplateCard
      title="Reports"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={clsx(
        "!bg-sky-50",
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]
      )}
    >
      <PageManageReports
        className={clsx("ui card", type !== "mobile" ? "!p-16" : "!p-4")}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};