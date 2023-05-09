import { EventTagObjectType } from "@/types";
import * as Yup from "yup";

export const RuleName = Yup.string()
  .min(3, "Name is too short! (min. 3 chars)")
  .max(50, "Name is too long! (max. 50 chars)")
  .required("Name is required.");

export const RuleDescription = Yup.string()
  .min(8, "Description is too short! (min. 8 chars)")
  .max(5000, "Description is too long! (max. 100 chars)")
  .required("Description is required.");

export const RuleReason = Yup.string()
  .min(8, "Reason is too short! (min. 8 chars)")
  .max(100, "Reason is too long! (max. 100 chars)")
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

export function validateImage(image: File) {
  if(image) {
    if(image.size > 2000000 ) return "Thumbnail cannot be larger than 2MB.";
    if(!["image/jpeg", "image/jpg", "image/png"].includes(image.type)) return "Image format must be .jpeg, .jpg, or .png";
  }
  return undefined;
}
