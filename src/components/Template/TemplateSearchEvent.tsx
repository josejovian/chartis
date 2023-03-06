import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { LayoutTemplateCard } from "@/components";
import { PageSearchEventCard } from "@/components/Page/SearchEvent";
import { EventSearchType, ResponsiveStyleType } from "@/types";
import { populateEvents } from "@/utils";
import { useIdentification, useScreen, useSearchEvent } from "@/hooks";
import { db } from "@/firebase";
import { ref, update } from "firebase/database";

export interface TemplateSearchEventProps {
  viewType?: EventSearchType;
  title: string;
}

export function TemplateSearchEvent({
  viewType,
  title,
}: TemplateSearchEventProps) {
  const {
    filteredEvents,
    handleFetchEvents,
    handleUpdateEvent,
    stateFilters,
    stateQuery,
    stateSortBy,
    stateSortDescending,
  } = useSearchEvent({ type: viewType });
  const router = useRouter();
  const { type } = useScreen();
  const stateIdentification = useIdentification();
  const identification = stateIdentification[0];
  const { user } = identification;

  useEffect(() => {
    handleFetchEvents();
  }, [handleFetchEvents]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePopulateDatabaseEvents = useCallback(async () => {
    if (!user || !user.uid) return;

    const samples = populateEvents(40, "admin");

    const updates: Record<string, unknown> = {};
    for (const sample of samples) {
      updates[`/events/${sample.id}`] = sample;
    }

    await update(ref(db), updates);
  }, [user]);

  return (
    <LayoutTemplateCard
      title={title}
      leftButton={{
        icon: "arrow left",
        onClick: () => {
          router.back();
        },
      }}
      classNameMain={LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE[type]}
    >
      <PageSearchEventCard
        className="PageSearchEventCard !bg-sky-50 p-4 !h-screen"
        events={filteredEvents}
        type={type}
        stateQuery={stateQuery}
        stateFilters={stateFilters}
        stateSortBy={stateSortBy}
        stateSortDescending={stateSortDescending}
        updateEvent={handleUpdateEvent}
      />
    </LayoutTemplateCard>
  );
}

const LAYOUT_TEMPLATE_CARD_PADDING_RESPONSIVE_STYLE: ResponsiveStyleType = {
  desktop_lg: "!px-10",
  desktop_sm: "!px-10",
  mobile: "",
};
