import { type User } from "firebase/auth";
import { USER_TYPES } from "@/consts";

export interface UserType {
  name: string;
  subscribedEvents?: string[];
}

export type UserObjectType = User | null;

export type UserPermissionType = (typeof USER_TYPES)[number];

export interface IdentificationType {
  user: UserObjectType;
  users: Record<string, UserType>;
  permission: UserPermissionType;
}
