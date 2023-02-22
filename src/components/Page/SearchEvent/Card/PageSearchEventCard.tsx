import { LayoutCard } from "@/components/Layout";
import { PageSearchEventHead } from "./PageSearchEventCardHead";
import { useState } from "react";
import { EVENT_TAGS } from "@/consts";

export interface PageSearchEventCardProps {
  className?: string;
}

export function PageSearchEventCard({ className }: PageSearchEventCardProps) {
  const stateFilters = useState<Record<number, boolean>>(
    EVENT_TAGS.map((_) => false)
  );

  return (
    <LayoutCard className={className}>
      <PageSearchEventHead stateFilters={stateFilters} />
    </LayoutCard>
  );
}
