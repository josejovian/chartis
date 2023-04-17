import { UserType } from "../auth";
import { EventType } from "../event";

export interface UpdateMapPathToParams {
  event: UpdateBaseParams<EventType>;
  user: UpdateBaseParams<UserType>;
}

interface UpdateBaseParams<K> {
  id: string;
  data: Partial<K>;
}
