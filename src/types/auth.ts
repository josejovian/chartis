import { type User } from "firebase/auth";
import { USER_TYPES } from "@/consts";

export type UserRoleType = "admin" | "user";

export interface UserDatabaseType {
  name: string;
  email?: string;
  joinDate: number;
  subscribedEvents?: Record<string, number>;
  unseenEvents?: Record<string, boolean>;
  role?: UserRoleType;
  ban?: boolean;
}

export interface UserType extends UserDatabaseType {
  id: string;
}

export type UserPermissionType = (typeof USER_TYPES)[number];

export interface IdentificationType {
  authUser?: User | null;
  user?: UserType | null;
  users: Record<string, UserType>;
  initialized: boolean;
}

export type UserProfileTabNameType =
  | "detail"
  | "edit-profile"
  | "edit-password";

export type UserProfileViewNameType = "admin" | "self" | "default";
