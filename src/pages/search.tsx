import { useRouter } from "next/router";
import { LayoutTemplateCard } from "@/components";
import { PageSearchEventCard } from "@/components/Page/SearchEvent";

export default function SearchEvent() {
  const router = useRouter();

  return (
    <LayoutTemplateCard
      title="Search"
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
    >
      <PageSearchEventCard className="PageSearchEventCard !bg-sky-50" />
    </LayoutTemplateCard>
  );
}
