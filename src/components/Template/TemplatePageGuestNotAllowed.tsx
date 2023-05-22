import { LayoutNotice, LayoutTemplateCard } from "../Layout";
import { Button } from "semantic-ui-react";
import { ASSET_NO_ACCESS } from "@/consts";
import { useModal, useScreen } from "@/hooks";
import { ModalAuthLogin } from "../Modal";
import { ResponsiveStyleType } from "@/types";
import { useMemo } from "react";

interface TemplatePageGuestNotAllowedProps {
  includeLayoutWrapper?: boolean;
}

export function TemplatePageGuestNotAllowed({
  includeLayoutWrapper,
}: TemplatePageGuestNotAllowedProps) {
  const { setModal } = useModal();
  const { type } = useScreen();

  const renderNotice = useMemo(
    () => (
      <LayoutNotice
        illustration={ASSET_NO_ACCESS}
        title="You must login to access this page."
        descriptionElement={
          <Button color="yellow" onClick={() => setModal(<ModalAuthLogin />)}>
            Login
          </Button>
        }
      />
    ),
    [setModal]
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
