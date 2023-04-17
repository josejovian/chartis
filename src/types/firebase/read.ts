import { QueryConstraint } from "firebase/firestore";
import { UserType } from "../auth";
import { EventType } from "../event";

export interface ReadMapPathToParams {
  event: ReadOneParams;
  events: ReadMultipleParams;
  user: ReadOneParams;
}

export interface ReadMapPathToReturn {
  event: EventType;
  events: EventType[];
  user: UserType;
}

export interface ReadOneParams {
  id: string;
}

export interface ReadMultipleParams {
  constraints: QueryConstraint[];
}
