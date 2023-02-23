import { EventType } from "@/types";
import { useCallback, useState } from "react";
import { Button, Label, SemanticSIZES } from "semantic-ui-react";

export interface EventButtonFollowProps {
  event: EventType;
  size?: SemanticSIZES;
}

export function EventButtonFollow({ event, size }: EventButtonFollowProps) {
  const { id, followerIds = [], guestFollowerCount } = event;

  const [followCount, setFollowCount] = useState(
    followerIds.length + (guestFollowerCount ?? 0)
  );
  const [followed, setFollowed] = useState(false);

  const handleFollowEvent = useCallback(async () => {
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
  }, [id]);

  return (
    <Button className="!m-0 !w-full" as="div" labelPosition="right" size={size}>
      <Button className="!w-full" size={size} onClick={handleFollowEvent}>
        {followed ? "Unfollow" : "Follow"}
      </Button>
      <Label as="a" basic>
        {followCount}
      </Label>
    </Button>
  );
}
