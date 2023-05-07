import { useRouter } from "next/router";
import { LayoutNotice, LayoutTemplateCard } from "../Layout";
import { Button } from "semantic-ui-react";
import { ResponsiveStyleType } from "@/types";
import { useScreen } from "@/hooks";
import clsx from "clsx";

export function TemplatePageNotFound() {
  const { type } = useScreen();
  const router = useRouter();

  return (
    <LayoutTemplateCard
      title=""
      classNameMain={clsx(
        "!bg-sky-50",
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]
      )}
    >
      <LayoutNotice
        illustration="/404.png"
        title="Page Not Found"
        descriptionElement={
          <Button color="yellow" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        }
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
