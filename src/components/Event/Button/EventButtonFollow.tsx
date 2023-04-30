import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fs } from "@/firebase";
import {
  Button,
  Label,
  type SemanticSIZES,
  type SemanticCOLORS,
} from "semantic-ui-react";
import { EventType, IdentificationType } from "@/types";
import { sleep } from "@/utils";
import { useToast } from "@/hooks";
import { doc, increment, updateDoc, writeBatch } from "firebase/firestore";
import {
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";

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
      ) as Record<string, number>;

      handleUpdateSubscribeClientSide(subscribed);
      setLoading(true);

      const dbRef = doc(fs, "events", id);

      const newSubscribe = subscribed
        ? (() => {
            const temp = { ...subscribe };
            delete temp[id];
            return temp;
          })()
        : {
            ...subscribe,
            [id]: event.version ?? 0,
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
          // Client side
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
          handleUpdateSubscribeClientSide(subscribe[id] !== undefined);
        });
      setLoading(false);
    } else if (user && user.uid && users[user.uid]) {
      const batch = writeBatch(fs);

      handleUpdateSubscribeClientSide(subscribed);
      setLoading(true);

      // Event's subscribers
      const updatedSubscribedIds = subscribed
        ? subscriberIds.filter((uid) => uid !== user.uid)
        : [...subscriberIds.filter((uid) => uid !== user.uid), user.uid];

      const subscribedEvents = users[user.uid].subscribedEvents;

      // User's subscribed events
      const updatedSubscribedEvents = subscribed
        ? (() => {
            const temp = { ...subscribedEvents };
            delete temp[id];
            return temp;
          })()
        : {
            ...subscribedEvents,
            [id]: event.version ?? 0,
          };

      setSubscribed((prev) => !prev);
      await sleep(200);

      const dbRef = doc(fs, FIREBASE_COLLECTION_EVENTS, id);
      const userRef = doc(fs, FIREBASE_COLLECTION_USERS, user.uid);

      batch.update(dbRef, {
        subscriberIds: updatedSubscribedIds,
        subscriberCount:
          updatedSubscribedIds.length + (guestSubscriberCount ?? 0),
      });

      batch.update(userRef, {
        subscribedEvents: updatedSubscribedEvents,
      });

      // Client side
      updateEvent(id, {
        subscriberIds: updatedSubscribedIds,
        subscriberCount:
          updatedSubscribedIds.length + (guestSubscriberCount ?? 0),
      });

      updateUserSubscribedEventClientSide(user.uid, id, event.version);

      await batch.commit().catch(() => {
        updateEvent(id, {
          subscriberIds,
          subscriberCount,
        });
        addToastPreset("post-fail");
        setSubscribed((prev) => !prev);
      });

      setLoading(false);
    }
  }, [
    addToastPreset,
    event.version,
    guestSubscriberCount,
    handleUpdateSubscribeClientSide,
    id,
    loading,
    permission,
    subscribed,
    subscriberCount,
    subscriberIds,
    updateEvent,
    updateUserSubscribedEventClientSide,
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
      color={isAuthor ? "grey" : "yellow"}
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
