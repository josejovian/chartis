import { USER_TYPES } from "@/consts";
import { UserPermissionType } from "@/types";

export function hasPermission(
  user: UserPermissionType,
  requirement: UserPermissionType
) {
  return USER_TYPES.indexOf(user) >= USER_TYPES.indexOf(requirement);
}
