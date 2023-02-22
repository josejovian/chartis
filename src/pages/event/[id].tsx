import { useRouter } from "next/router";
import { LayoutTemplateCard, PageViewEventCard } from "@/components";
import { EVENT_DUMMY_1 } from "@/consts";

export default function ViewEvent() {
  const router = useRouter();
  const { id } = router.query;

  const event = EVENT_DUMMY_1;
  console.log(id);

  return (
    <LayoutTemplateCard
      title="Event"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
    >
      <PageViewEventCard className="card ui" event={event} />
    </LayoutTemplateCard>
  );
}
