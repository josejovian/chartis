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

export default function ManageUsersPage() {
  const router = useRouter();
  const { type } = useScreen();

  const { stateIdentification } = useIdentification();
  const auth = getAuth();
  const isAuthorized = useAuthorization({
    auth,
    stateIdentification,
    minPermission: "admin",
  });

  return (
    <LayoutTemplateCard
      title="Users"
      htmlTitle="Manage Users"
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
      authorized={isAuthorized}
      minPermission="guest"
      unauthorizedElement={<TemplatePageNotFound />}
    >
      <PageManageUsers
        isAuthorized={isAuthorized}
        className={clsx("ui card", type === "desktop_lg" ? "!p-16" : "!p-4")}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-20",
  desktop_sm: "!px-12",
  mobile: "",
};
