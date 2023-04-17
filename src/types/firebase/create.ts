import { UserType } from "../auth";
import { EventType } from "../event";

export interface CreateMapPathToParams {
  event: CreateBaseParams<EventType>;
  user: CreateBaseParams<UserType>;
}

interface CreateBaseParams<K> {
  data: K;
}
