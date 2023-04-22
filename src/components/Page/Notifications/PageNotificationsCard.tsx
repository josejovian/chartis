import { useMemo } from "react";
import clsx from "clsx";
import { LayoutCard, LayoutNotice, NotificationCard } from "@/components";
import { useNotification } from "@/hooks";

export interface PageNotificationsCardProps {
  className?: string;
}

export function PageNotificationsCard({
  className,
}: PageNotificationsCardProps) {
  const { updates, setUpdates } = useNotification();

  const renderNotifications = useMemo(
    () => (
      <div
        className={clsx(
          "flex flex-col gap-4",
          "px-4 mr-4 py-0.5 h-full overflow-y-auto"
        )}
      >
        {updates.map((update) => (
          <NotificationCard
            key={`Update_${update.eventId}-${update.id}`}
            update={update}
            setUpdates={setUpdates}
          />
        ))}
      </div>
    ),
    [setUpdates, updates]
  );

  const renderEmptyNotifications = useMemo(
    () => (
      <LayoutNotice
        title="All Clear!"
        description="You will see future updates of events you follow here."
      />
    ),
    []
  );

  return (
    <LayoutCard className={className}>
      {updates.length > 0 ? renderNotifications : renderEmptyNotifications}
    </LayoutCard>
  );
}
