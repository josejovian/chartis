import { EventType } from "@/types";
import { useCallback, useState } from "react";
import { Button, Icon, Label } from "semantic-ui-react";

export interface EventButtonFollowProps {
  event: EventType;
}

export function EventButtonFollow({ event }: EventButtonFollowProps) {
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
    <Button className="!m-0" as="div" labelPosition="right">
      <Button onClick={handleFollowEvent}>
        <Icon name={followed ? "calendar check" : "calendar plus"} />
        {followed ? "Followed" : "Follow"}
      </Button>
      <Label as="a" basic>
        {followCount}
      </Label>
    </Button>
  );
}
