import { useRouter } from "next/router";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { LayoutNotice, LayoutTemplate } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export default function Custom500() {
  const router = useRouter();
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
      <LayoutNotice
        illustration="/500.png"
        title="Server Side Error"
        descriptionElement={
          <Button color="yellow" onClick={() => router.push("/")}>
            Go to Home
          </Button>
        }
      />
    </LayoutTemplate>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20 !py-12",
  desktop_sm: "!px-20 !py-12",
  mobile: "",
};
