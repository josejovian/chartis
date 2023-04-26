import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Label, type SemanticSIZES } from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { useEvent, useToast } from "@/hooks";

export interface EventButtonFollowProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
  updateUserSubscribedEventClientSide: (
    userId: string,
    eventId: string,
    version?: number
  ) => void;
}

export function EventButtonFollow({
  event,
  identification,
  size,
  updateEvent,
  updateUserSubscribedEventClientSide,
}: EventButtonFollowProps) {
  const { addToastPreset } = useToast();

  const { id, subscriberIds = [], guestSubscriberCount } = event;

  const { permission, user, users } = identification;

  const [subscriberCount, setSubscriberCount] = useState(
    subscriberIds.length + (guestSubscriberCount ?? 0)
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const { toggleEventSubscription } = useEvent({});

  const handleFollowEvent = useCallback(async () => {
    if (loading) return;

    setSubscriberCount((prev) => prev + (subscribed ? -1 : 1));
    setLoading(true);

    toggleEventSubscription(id, event.version ?? 0, subscribed, user?.uid)
      .then(() => {
        setSubscribed((prev) => !prev);
      })
      .catch((e) => {
        addToastPreset("post-fail");
        setLoading(false);
        setSubscribed((prev) => !prev);
        setSubscriberCount((prev) => prev + (subscribed ? -1 : 1));
      })
      .finally(async () => {
        setLoading(false);
      });
  }, [
    addToastPreset,
    event.version,
    id,
    loading,
    subscribed,
    toggleEventSubscription,
    user?.uid,
  ]);

  const handleInitializeSubscribeState = useCallback(() => {
    if (initialized.current || typeof window === "undefined") return;

    let status = false;
    if (permission === "guest") {
      const subscribe = JSON.parse(
        localStorage.getItem("subscribe") ?? "{}"
      ) as Record<string, boolean>;
      status = subscribe[id];
    } else if (user && user.uid && users[user.uid]) {
      status = subscriberIds.includes(user.uid);
    }
    setSubscribed(status);
    initialized.current = true;
  }, [id, permission, subscriberIds, user, users]);

  useEffect(() => {
    handleInitializeSubscribeState();
  }, [handleInitializeSubscribeState]);

  return (
    <Button className="!m-0 !w-fit" as="div" labelPosition="right" size={size}>
      <Button className="!w-full" size={size} onClick={handleFollowEvent}>
        {subscribed ? "Unfollow" : "Follow"}
      </Button>
      <Label as="a" basic>
        {subscriberCount}
      </Label>
    </Button>
  );
}
