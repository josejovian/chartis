import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Label, type SemanticSIZES } from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { useToast } from "@/hooks";
import { toggleEventSubscription } from "@/utils";

export interface EventButtonFollowProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
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
  updateUserSubscribedEventClientSide,
  updateClientSideEvent,
}: EventButtonFollowProps) {
  const { addToastPreset } = useToast();

  const { id, subscriberIds = [], guestSubscriberCount, authorId } = event;

  const { user, users, initialized } = identification;
  const test = useMemo(() => (user ? users[user.id] : null), [user, users]);

  const isAuthor = useMemo(
    () => Boolean(user && user.id === authorId),
    [authorId, user]
  );

  const [subscriberCount, setSubscriberCount] = useState(
    subscriberIds.length + (guestSubscriberCount ?? 0)
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const initializedSubscription = useRef(false);

  const handleFollowEvent = useCallback(async () => {
    if (loading) return;

    const currentCount = subscriberCount;
    const currentSubscribed = subscribed;
    const nextCount = currentCount + (currentSubscribed ? -1 : 1);
    setSubscriberCount(nextCount);
    setLoading(true);

    if (user) {
      const newSubscriberIds = subscribed
        ? subscriberIds.filter((sid) => sid !== user.id)
        : [...subscriberIds, user.id];

      // updateClientSideEvent(id, {
      //   subscriberIds: newSubscriberIds,
      //   subscriberCount: newSubscriberIds.length + (guestSubscriberCount ?? 0),
      // });
    }

    toggleEventSubscription(id, event.version ?? 0, subscribed, user?.id)
      .then(() => {
        if (user) {
          updateUserSubscribedEventClientSide(
            event.id,
            currentSubscribed ? undefined : event.version
          );
          console.log(currentSubscribed ? undefined : event.version);
        }
        setSubscribed((prev) => !prev);

        setLoading(false);
      })
      .catch((e) => {
        if (user) {
          // updateClientSideEvent(id, {
          //   subscriberIds,
          //   subscriberCount,
          // });
        }
        addToastPreset("fail-post");
        setLoading(false);
        setSubscribed((prev) => !prev);
        setSubscriberCount(currentCount);
      });
  }, [
    addToastPreset,
    event.id,
    event.version,
    id,
    loading,
    subscribed,
    subscriberCount,
    subscriberIds,
    updateUserSubscribedEventClientSide,
    user,
  ]);

  const handleInitializeSubscribeState = useCallback(() => {
    if (
      !initialized ||
      initializedSubscription.current ||
      typeof window === "undefined"
    )
      return;

    let status = false;
    if (!user) {
      const subscribe = JSON.parse(
        localStorage.getItem("subscribe") ?? "{}"
      ) as Record<string, boolean>;
      status = subscribe[id];
    } else if (users && user) {
      status =
        subscriberIds.includes(user.id) ||
        Object.keys(users[user.id].subscribedEvents ?? {}).includes(event.id);
    }
    setSubscribed(status);
    initializedSubscription.current = true;
  }, [event.id, id, initialized, subscriberIds, user, users]);

  useEffect(() => {
    handleInitializeSubscribeState();
  }, [handleInitializeSubscribeState]);

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
