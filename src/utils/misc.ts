import { USER_TYPES } from "@/consts";
import { UserPermissionType } from "@/types";

export async function sleep(ms: number) {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, ms);
  });
}

export function getNameInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("");
}

export function hasPermission(
  user: UserPermissionType,
  requirement?: UserPermissionType
) {
  if (requirement === "guest") return user === requirement;

  return (
    !requirement || USER_TYPES.indexOf(user) >= USER_TYPES.indexOf(requirement)
  );
}
