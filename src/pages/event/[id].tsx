import { LayoutTemplate, PageViewEventCard } from "@/components";
import { useScreen } from "@/hooks";
import { EVENT_DUMMY_1 } from "@/consts";
import { useRouter } from "next/router";
import clsx from "clsx";

export default function ViewEvent() {
  const router = useRouter();
  const { type } = useScreen();
  const { id } = router.query;

  console.log("Query ID: ", id);

  const event = EVENT_DUMMY_1;

  return (
    <LayoutTemplate
      title="Event"
      classNameMain={clsx("justify-center", type !== "mobile" && "p-12")}
    >
      <PageViewEventCard event={event} />
    </LayoutTemplate>
  );
}
