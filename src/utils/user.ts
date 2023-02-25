export function getNameInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((word) => word[0])
    .join("");
}
