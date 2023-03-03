import { User } from "firebase/auth";
import { USER_TYPES } from "@/consts";

export type UserObjectType = User | null;

export type UserPermissionType = (typeof USER_TYPES)[number];

export interface UserType {
  user: UserObjectType;
  users: Record<string, string>;
  permission: UserPermissionType;
}
