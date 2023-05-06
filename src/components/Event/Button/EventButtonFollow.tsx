import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Label,
  type SemanticSIZES,
  type SemanticCOLORS,
} from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { useEvent, useToast } from "@/hooks";

export interface EventButtonFollowProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
  color?: SemanticCOLORS;
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
  color = "yellow",
  updateEvent,
  updateUserSubscribedEventClientSide,
}: EventButtonFollowProps) {
  const { addToastPreset } = useToast();

  const { id, subscriberIds = [], guestSubscriberCount, authorId } = event;

  const { user, users } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.id === authorId),
    [authorId, user]
  );

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

    toggleEventSubscription(id, event.version ?? 0, subscribed, user?.id)
      .then(() => {
        setSubscribed((prev) => !prev);
      })
      .catch((e) => {
        addToastPreset("fail-post");
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
    user?.id,
  ]);

  const handleInitializeSubscribeState = useCallback(() => {
    if (initialized.current || typeof window === "undefined") return;

    let status = false;
    if (!user) {
      const subscribe = JSON.parse(
        localStorage.getItem("subscribe") ?? "{}"
      ) as Record<string, boolean>;
      status = subscribe[id];
    } else if (user && user.id && users[user.id]) {
      status = subscriberIds.includes(user.id);
    }
    setSubscribed(status);
    initialized.current = true;
  }, [id, subscriberIds, user, users]);

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
