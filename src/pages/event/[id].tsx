import { useRouter } from "next/router";
import clsx from "clsx";
import { LayoutTemplate, PageViewEventCard } from "@/components";
import { useScreen } from "@/hooks";
import { ResponsiveStyleType } from "@/types";
import { EVENT_DUMMY_1 } from "@/consts";

export default function ViewEvent() {
  const router = useRouter();
  const { type } = useScreen();
  const { id } = router.query;

  const event = EVENT_DUMMY_1;
  console.log(id);

  return (
    <LayoutTemplate
      title="Event"
      classNameMain={clsx(
        "justify-center",
        type !== "mobile" && "py-12",
        VIEW_EVENT_PADDING_RESPONSIVE_STYLE[type]
      )}
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
    >
      <PageViewEventCard event={event} />
    </LayoutTemplate>
  );
}

const VIEW_EVENT_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-40",
  desktop_sm: "!px-40",
  mobile: "",
};
