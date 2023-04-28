import { type User } from "firebase/auth";
import { USER_TYPES } from "@/consts";

export type UserRoleType = "admin" | "user";

export interface UserDatabaseType {
  name: string;
  email: string;
  joinDate: number;
  subscribedEvents?: Record<string, number>;
  unseenEvents?: Record<string, boolean>;
  notificationCount?: number;
  role?: UserRoleType;
  ban?: boolean;
}

export interface UserType extends UserDatabaseType {
  id?: string;
}

export type UserObjectType = User | null;

export type UserPermissionType = (typeof USER_TYPES)[number];

export interface IdentificationType {
  user: UserObjectType;
  users: Record<string, UserType>;
  permission: UserPermissionType;
}
