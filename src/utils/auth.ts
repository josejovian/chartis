import { USER_TYPES } from "@/consts";
import { UserPermissionType } from "@/types";

export function hasPermission(
  user: UserPermissionType,
  requirement?: UserPermissionType
) {
  if (requirement === "guest") return user === requirement;

  return (
    !requirement || USER_TYPES.indexOf(user) >= USER_TYPES.indexOf(requirement)
  );
}
