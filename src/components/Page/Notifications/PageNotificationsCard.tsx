import clsx from "clsx";
import { LayoutCard, LayoutNotice, NotificationCard } from "@/components";
import { Button, Loader } from "semantic-ui-react";
import { useMemo } from "react";
import { NotificationData } from "@/types";

export interface PageNotificationsCardProps {
  className?: string;
  updateData: NotificationData[];
  handleReadAllNotifications: () => Promise<void>;
  handleReadNotification: (
    eventId: string,
    eventVersion: number
  ) => Promise<void>;
  isLoading: boolean;
}

export function PageNotificationsCard({
  className,
  updateData,
  handleReadAllNotifications,
  handleReadNotification,
  isLoading,
}: PageNotificationsCardProps) {
  const renderNotifications = useMemo(
    () => (
      <>
        <div className="h-full">
          <div className="flex flex-row items-center justify-between px-4 pb-8">
            <span className="text-16px">
              You have {updateData.length} unread notifications.
            </span>
            <Button onClick={handleReadAllNotifications} color="yellow">
              Mark All as Read
            </Button>
          </div>
          <div
            className={NOTIFICATION_LIST_STYLE}
            style={{ height: "calc(100% - 73.13px)" }}
          >
            {updateData.map((update) => (
              <NotificationCard
                key={`Update_${update.eventId}`}
                updateData={update}
                handleReadNotification={handleReadNotification}
              />
            ))}
          </div>
        </div>
      </>
    ),
    [handleReadAllNotifications, handleReadNotification, updateData]
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
      {isLoading ? (
        <Loader active={isLoading} inline="centered" />
      ) : updateData.length > 0 ? (
        renderNotifications
      ) : (
        renderEmptyNotifications
      )}
    </LayoutCard>
  );
}

const NOTIFICATION_LIST_STYLE = clsx(
  "flex flex-col overflow-y-auto",
  "px-4 pt-0.5 mr-4"
);
