import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fs } from "@/firebase";
import { Button, Label, type SemanticSIZES } from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { sleep } from "@/utils";
import { useToast } from "@/hooks";
import { doc, increment, updateDoc } from "firebase/firestore";

export interface EventButtonFollowProps {
  event: EventType;
  updateEvent: (id: string, newEvent: Partial<EventType>) => void;
  identification: IdentificationType;
  size?: SemanticSIZES;
}

export function EventButtonFollow({
  event,
  updateEvent,
  identification,
  size,
}: EventButtonFollowProps) {
  const { addToastPreset } = useToast();

  const { id, subscriberIds = [], guestSubscriberCount, authorId } = event;

  const { permission, user, users } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.uid === authorId),
    [authorId, user]
  );

  const [subscriberCount, setSubscriberCount] = useState(
    subscriberIds.length + (guestSubscriberCount ?? 0)
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const initialized = useRef(false);

  const handleUpdateSubscribeClientSide = useCallback(
    (previouslySubscribed: boolean) => {
      setSubscriberCount((prev) => prev + 1 * (previouslySubscribed ? -1 : 1));
    },
    []
  );

  const handleFollowEvent = useCallback(async () => {
    if (loading) return;

    if (permission === "guest") {
      const subscribe = JSON.parse(
        localStorage.getItem("subscribe") ?? "{}"
      ) as Record<string, boolean>;

      handleUpdateSubscribeClientSide(subscribed);
      setLoading(true);

      const dbRef = doc(fs, "events", id);

      // Atomically increment the population of the city by 50.

      const newSubscribe = subscribed
        ? (() => {
            const temp = { ...subscribe };
            delete temp[id];
            return temp;
          })()
        : {
            ...subscribe,
            [id]: true,
          };

      setSubscribed((prev) => !prev);
      await sleep(200);

      await updateDoc(dbRef, {
        guestSubscriberCount: increment(subscribed ? -1 : 1),
        subscriberCount:
          subscriberIds.length +
          (guestSubscriberCount ?? 0) +
          (subscribed ? -1 : 1),
      })
        .then(() => {
          updateEvent(id, {
            subscriberCount:
              subscriberIds.length +
              (guestSubscriberCount ?? 0) +
              (subscribed ? -1 : 1),
          });
          localStorage.setItem("subscribe", JSON.stringify(newSubscribe));
        })
        .catch(() => {
          addToastPreset("post-fail");
          setLoading(false);
          setSubscribed((prev) => !prev);
          handleUpdateSubscribeClientSide(subscribe[id]);
        });
      setLoading(false);
    } else if (user && user.uid && users[user.uid]) {
      handleUpdateSubscribeClientSide(subscribed);
      setLoading(true);

      // Event's subscribers
      const updatedSubscribedIds = subscribed
        ? subscriberIds.filter((uid) => uid !== user.uid)
        : [...subscriberIds.filter((uid) => uid !== user.uid), user.uid];

      // User's subscribed events
      const subscribedEvents = users[user.uid].subscribedEvents ?? [];
      const updatedSubscribedEvents = subscribed
        ? subscribedEvents.filter((eventId) => eventId !== id)
        : [...subscribedEvents.filter((eventId) => eventId !== id), id];

      setSubscribed((prev) => !prev);
      await sleep(200);

      const dbRef = doc(fs, "events", id);
      await updateDoc(dbRef, {
        subscriberIds: updatedSubscribedIds,
        subscribedEvents: updatedSubscribedEvents,
        subscriberCount:
          updatedSubscribedIds.length + (guestSubscriberCount ?? 0),
      })
        .then(() => {
          addToastPreset(subscribed ? "unfollow" : "follow");
          updateEvent(id, {
            subscriberIds: updatedSubscribedIds,
            subscriberCount:
              updatedSubscribedIds.length + (guestSubscriberCount ?? 0),
          });
        })
        .catch(() => {
          addToastPreset("post-fail");
          setSubscribed((prev) => !prev);
        });
      setLoading(false);
    }
  }, [
    addToastPreset,
    guestSubscriberCount,
    handleUpdateSubscribeClientSide,
    id,
    loading,
    permission,
    subscribed,
    subscriberIds,
    updateEvent,
    user,
    users,
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
      >
        {subscribed ? "Unfollow" : "Follow"}
      </Button>
      <Label as="a" basic>
        {subscriberCount}
      </Label>
    </Button>
  );
}
