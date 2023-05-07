import { useMemo } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import clsx from "clsx";
import {
  LayoutTemplateCard,
  TemplatePageNotFound,
  PageManageUsers,
} from "@/components";
import { useAuthorization, useIdentification, useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";

export default function ManageUsers() {
  const router = useRouter();
  const { type } = useScreen();

  const { stateIdentification } = useIdentification();
  const auth = getAuth();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "admin",
  });

  const renderNotFound = useMemo(() => <TemplatePageNotFound />, []);

  const renderPage = useMemo(
    () => (
      <LayoutTemplateCard
        title="Users"
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
        <PageManageUsers
          isAuthorized={isAuthorized}
          className={clsx("ui card", type !== "mobile" ? "!p-16" : "!p-4")}
        />
      </LayoutTemplateCard>
    ),
    [isAuthorized, router, type]
  );

  return isAuthorized ? renderPage : renderNotFound;
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-20",
  mobile: "",
};
