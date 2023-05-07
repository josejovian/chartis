import { LayoutNotice, LayoutTemplateCard } from "../Layout";
import { Button } from "semantic-ui-react";
import clsx from "clsx";
import { ASSET_NO_ACCESS } from "@/consts";
import { useModal, useScreen } from "@/hooks";
import { ModalAuthLogin } from "../Modal";
import { ResponsiveStyleType } from "@/types";

export function TemplatePageGuestNotAllowed() {
  const { type } = useScreen();
  const { setModal } = useModal();

  return (
    <LayoutTemplateCard
      title=""
      classNameMain={clsx(
        "!bg-sky-50",
        LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]
      )}
    >
      <LayoutNotice
        illustration={ASSET_NO_ACCESS}
        title="You must login to access this page."
        descriptionElement={
          <Button color="yellow" onClick={() => setModal(<ModalAuthLogin />)}>
            Login
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
