import { useCallback, useEffect, useMemo, useState } from "react";
import { getDatabase, increment, ref, update } from "firebase/database";
import { db } from "@/firebase";
import { Button, Label, SemanticSIZES } from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { sleep } from "@/utils";

export interface EventButtonFollowProps {
  event: EventType;
  identification: IdentificationType;
  size?: SemanticSIZES;
}

export function EventButtonFollow({
  event,
  identification,
  size,
}: EventButtonFollowProps) {
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
      await sleep(200);

      const dbRef = ref(getDatabase());
      const updates: Record<string, unknown> = {};
      updates[`events/${id}/guestSubscriberCount`] = increment(
        subscribed ? -1 : 1
      );

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
      await update(dbRef, updates)
        .then(() => {
          setLoading(false);
          localStorage.setItem("subscribe", JSON.stringify(newSubscribe));
        })
        .catch(() => {
          setLoading(false);
          setSubscribed((prev) => !prev);
          handleUpdateSubscribeClientSide(subscribe[id]);
        });
    } else if (user && user.uid && users[user.uid]) {
      handleUpdateSubscribeClientSide(subscribed);
      setLoading(true);
      await sleep(200);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};
      updates[`/events/${id}/subscriberIds`] = updatedSubscribedIds;
      updates[`/user/${user.uid}/subscribedEvents`] = updatedSubscribedEvents;
      await update(ref(db), updates).catch(() => {
        setSubscribed((prev) => !prev);
      });
      setLoading(false);
    }
  }, [
    handleUpdateSubscribeClientSide,
    id,
    loading,
    permission,
    subscribed,
    subscriberIds,
    user,
    users,
  ]);

  const handleInitializeSubscribeState = useCallback(() => {
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
  }, [id, permission, subscriberIds, user, users]);

  useEffect(() => {
    handleInitializeSubscribeState();
  }, [handleInitializeSubscribeState]);

  return (
    <Button
      className="!m-0 !w-full"
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
