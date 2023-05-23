import { EventTagObjectType } from "@/types";
import * as Yup from "yup";
import {
  VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH,
  VALIDATION_EVENT_DESCRIPTION_MIN_LENGTH,
  VALIDATION_EVENT_LOCATION_MAX_LENGTH,
  VALIDATION_EVENT_NAME_MAX_LENGTH,
  VALIDATION_EVENT_NAME_MIN_LENGTH,
  VALIDATION_EVENT_ORGANIZER_MAX_LENGTH,
  VALIDATION_REPORT_COMMENT_MAX_LENGTH,
  VALIDATION_REPORT_COMMENT_MIN_LENGTH,
  VALIDATION_REPORT_REASON_MAX_LENGTH,
  VALIDATION_REPORT_REASON_MIN_LENGTH,
  VALIDATION_USER_NAME_MAX_LENGTH,
  VALIDATION_USER_NAME_MIN_LENGTH,
} from "./const";

export const RuleName = Yup.string()
  .min(
    VALIDATION_USER_NAME_MIN_LENGTH,
    `Name is too short! (min. ${VALIDATION_USER_NAME_MIN_LENGTH} chars)`
  )
  .max(
    VALIDATION_USER_NAME_MAX_LENGTH,
    `Name is too long! (max. ${VALIDATION_USER_NAME_MAX_LENGTH} chars)`
  )
  .required("Name is required.");

export const RuleDescription = Yup.string()
  .min(
    VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH,
    `Description is too short! (min. ${VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH} chars)`
  )
  .max(
    VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH,
    `Description is too long! (max. ${VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH} chars)`
  )
  .required("Description is required.");

export const RuleReason = Yup.string()
  .min(
    VALIDATION_REPORT_REASON_MIN_LENGTH,
    `Reason is too short! (min. ${VALIDATION_REPORT_REASON_MIN_LENGTH} chars)`
  )
  .max(
    VALIDATION_REPORT_REASON_MAX_LENGTH,
    `Reason is too long! (max. ${VALIDATION_REPORT_REASON_MAX_LENGTH} chars)`
  )
  .required("Reason is required.");

export const RuleComment = Yup.string()
  .min(
    VALIDATION_REPORT_COMMENT_MIN_LENGTH,
    `Comment is too short! (min. ${VALIDATION_REPORT_COMMENT_MIN_LENGTH} chars)`
  )
  .max(
    VALIDATION_REPORT_COMMENT_MAX_LENGTH,
    `Comment is too long! (max. ${VALIDATION_REPORT_COMMENT_MAX_LENGTH} chars)`
  )
  .required("Comment is required.");

export function validateEventName(name: string) {
  if (name.length === 0) return "Name is required.";
  if (name.length < VALIDATION_EVENT_NAME_MIN_LENGTH)
    return `Name is too short! (min. ${VALIDATION_EVENT_NAME_MIN_LENGTH} chars)`;
  if (name.length > VALIDATION_EVENT_NAME_MAX_LENGTH)
    return `Name is too long! (max. ${VALIDATION_EVENT_NAME_MAX_LENGTH} chars)`;
  return undefined;
}

export function validateEventDescription(description: string) {
  if (description.length === 0) return "Description is required.";
  if (description.length < VALIDATION_EVENT_DESCRIPTION_MIN_LENGTH)
    return `Description is too short (min. ${VALIDATION_EVENT_DESCRIPTION_MIN_LENGTH} chars)`;
  if (description.length > VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH)
    return `Description is too long (max. ${VALIDATION_EVENT_DESCRIPTION_MAX_LENGTH} chars)`;
  return undefined;
}

export function validateStartDate(start?: number) {
  if (!start) return "Start date is required.";
  return undefined;
}

export function validateLocation(string?: string) {
  if (string && string.length > VALIDATION_EVENT_LOCATION_MAX_LENGTH)
    return `Location is too long (max. ${VALIDATION_EVENT_LOCATION_MAX_LENGTH})`;
  return undefined;
}

export function validateOrganizer(string?: string) {
  if (string && string.length > VALIDATION_EVENT_ORGANIZER_MAX_LENGTH)
    return `Organizer is too long (max. ${VALIDATION_EVENT_ORGANIZER_MAX_LENGTH})`;
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
  if (image) {
    if (image.size > 2000000) return "Thumbnail cannot be larger than 2MB.";
    if (!["image/jpeg", "image/jpg", "image/png"].includes(image.type))
      return "Image format must be .jpeg, .jpg, or .png";
  }
  return undefined;
}
