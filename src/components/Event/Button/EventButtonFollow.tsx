import { useCallback, useMemo, useState } from "react";
import { Button, Label, type SemanticSIZES } from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { useToast } from "@/hooks";
import { sleep, toggleEventSubscription } from "@/utils";

export interface EventButtonFollowProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  subscribed?: boolean;
  updateUserSubscribedEventClientSide: (
    eventId: string,
    version?: number
  ) => void;
  updateClientSideEvent: (eventId: string, event: Partial<EventType>) => void;
}

export function EventButtonFollow({
  event,
  identification,
  size,
  subscribed,
  updateUserSubscribedEventClientSide,
  updateClientSideEvent,
}: EventButtonFollowProps) {
  const { addToastPreset } = useToast();

  const { id, subscriberIds = [], guestSubscriberCount, authorId } = event;
  const { user } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.id === authorId),
    [authorId, user]
  );

  const [subscriberCount, setSubscriberCount] = useState(
    (() =>
      user
        ? subscriberIds.filter((sid) => sid !== user.id).length +
          (guestSubscriberCount ?? 0) +
          (subscribed ? 1 : 0)
        : subscriberIds.length + (guestSubscriberCount ?? 0))()
  );
  const [loading, setLoading] = useState(false);

  const handleFollowEvent = useCallback(async () => {
    if (loading) return;

    const currentSubscribe = subscribed;
    const currentCount = subscriberCount;
    const nextCount = currentCount + (currentSubscribe ? -1 : 1);

    setLoading(true);
    await sleep(100);
    setSubscriberCount(nextCount);

    // Client side update
    updateClientSideEvent(id, {
      guestSubscriberCount: user
        ? guestSubscriberCount
        : (guestSubscriberCount ?? 0) + (currentSubscribe ? -1 : 1),
      subscriberCount: nextCount,
    });
    updateUserSubscribedEventClientSide(
      event.id,
      currentSubscribe ? undefined : event.version
    );

    // Server side update
    toggleEventSubscription(
      id,
      event.version ?? 0,
      Boolean(currentSubscribe),
      user?.id
    )
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        updateClientSideEvent(id, {
          guestSubscriberCount: guestSubscriberCount,
          subscriberCount: currentCount,
        });
        updateUserSubscribedEventClientSide(
          event.id,
          !currentSubscribe ? undefined : event.version
        );
        addToastPreset("fail-post");
        setLoading(false);
      });
  }, [
    addToastPreset,
    event.id,
    event.version,
    guestSubscriberCount,
    id,
    loading,
    subscribed,
    subscriberCount,
    updateClientSideEvent,
    updateUserSubscribedEventClientSide,
    user,
  ]);

  return (
    <Button
      className="!m-0 !w-fit"
      as="div"
      labelPosition="right"
      size={size}
      disabled={isAuthor}
    >
      <Button
        className="!w-full"
        size={size}
        onClick={handleFollowEvent}
        disabled={isAuthor}
        color={subscribed ? "green" : "yellow"}
      >
        {subscribed ? "Unfollow" : "Follow"}
      </Button>
      <Label as="a" basic>
        {subscriberCount}
      </Label>
    </Button>
  );
}
