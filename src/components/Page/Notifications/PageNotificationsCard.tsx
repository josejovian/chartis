import clsx from "clsx";
import { LayoutCard, LayoutNotice, NotificationCard } from "@/components";
import { Button, Loader } from "semantic-ui-react";
import { useMemo } from "react";
import { NotificationData } from "@/types";

export interface PageNotificationsCardProps {
  className?: string;
  udpateData: NotificationData[];
  handleReadAllNotifications: () => Promise<void>;
  handleReadNotification: (
    eventId: string,
    eventVersion: number
  ) => Promise<void>;
  isLoading: boolean;
}

export function PageNotificationsCard({
  className,
  udpateData,
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
              You have {udpateData.length} unread notifications.
            </span>
            <Button
              onClick={() => {
                return null;
              }}
              color="yellow"
            >
              Mark All as Read
            </Button>
          </div>
          <div
            className={NOTIFICATION_LIST_STYLE}
            style={{ height: "calc(100% - 73.13px)" }}
          >
            {udpateData.map((update) => (
              <NotificationCard
                key={`Update_${update.eventId}`}
                udpateData={update}
                handleReadNotification={handleReadNotification}
              />
            ))}
          </div>
        </div>
      </>
    ),
    [handleReadNotification, udpateData]
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
      ) : udpateData.length > 0 ? (
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
