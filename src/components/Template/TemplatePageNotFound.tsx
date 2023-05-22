import { useRouter } from "next/router";
import { LayoutNotice, LayoutTemplateCard } from "../Layout";
import { Button } from "semantic-ui-react";
import { useMemo } from "react";
import { ResponsiveStyleType } from "@/types";
import { useScreen } from "@/hooks";

interface TemplatePageNotFoundProps {
  includeLayoutWrapper?: boolean;
}

export function TemplatePageNotFound({
  includeLayoutWrapper,
}: TemplatePageNotFoundProps) {
  const router = useRouter();
  const { type } = useScreen();

  const renderNotice = useMemo(
    () => (
      <LayoutNotice
        illustration="/404.png"
        title="Page Not Found"
        descriptionElement={
          <Button color="yellow" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        }
      />
    ),
    [router]
  );

  return includeLayoutWrapper ? (
    <LayoutTemplateCard
      title=""
      htmlTitle="Page Not Found"
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      {renderNotice}
    </LayoutTemplateCard>
  ) : (
    renderNotice
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
