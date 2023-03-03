import { useCallback, useMemo, useState } from "react";
import { Button, Label, SemanticSIZES } from "semantic-ui-react";
import { EventType, UserType } from "@/types";

export interface EventButtonFollowProps {
  event: EventType;
  identification: UserType;
  size?: SemanticSIZES;
}

export function EventButtonFollow({
  event,
  identification,
  size,
}: EventButtonFollowProps) {
  const { id, followerIds = [], guestFollowerCount, authorId } = event;
  const { permission, user } = identification;

  const isAuthor = useMemo(
    () => Boolean(user && user.uid === authorId),
    [authorId, user]
  );

  const [followCount, setFollowCount] = useState(
    followerIds.length + (guestFollowerCount ?? 0)
  );
  const [followed, setFollowed] = useState(false);

  const handleFollowEvent = useCallback(async () => {
    if (permission === "guest" || isAuthor) return;

    const follow = JSON.parse(localStorage.getItem("follow") ?? "{}") as Record<
      string,
      boolean
    >;
    setFollowCount((prev) => prev + 1 * (follow[id] ? -1 : 1));
    setFollowed((prev) => !prev);
    localStorage.setItem(
      "follow",
      JSON.stringify({
        ...follow,
        [id]: !follow[id],
      })
    );
  }, [id, isAuthor, permission]);

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
        {followed ? "Unfollow" : "Follow"}
      </Button>
      <Label as="a" basic>
        {followCount}
      </Label>
    </Button>
  );
}
