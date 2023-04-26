import { EventTagObjectType } from "@/types";
import * as Yup from "yup";

export const RuleName = Yup.string()
  .min(3, "Name is too short!")
  .max(50, "Name is too long!")
  .required("Name is required.");

export const RuleEmail = Yup.string()
  .email("Email is invalid.")
  .required("Email is required.");

export const RulePassword = Yup.string().required("Password is required.");

export const RuleDescription = Yup.string()
  .min(8, "Description is too short!")
  .max(5000, "Description is too long!")
  .required("Description is required.");

export const RuleReason = Yup.string()
  .min(8, "Reason is too short!")
  .max(200, "Reason is too long!")
  .required("Reason is required.");

export function validateStartDate(start?: number) {
  if (!start) return "Start date is required.";
  return undefined;
}

export function validateEndDate(start?: number, end?: number) {
  if (start && end && end < start)
    return "End date must not be earlier than the start date.";
  if (start && end && end === start)
    return "End date must not be the same as the start date.";
  if (!start && end)
    return "End date cannot be set unless start date is also set.";
  return undefined;
}

export function validateTags(tags: EventTagObjectType) {
  if (Object.keys(tags).length === 0) return "Event should have one tag.";
  return undefined;
}
