import { ToastPresetType, ToastType } from "@/types";

export const TOAST_PRESETS: Record<ToastPresetType, ToastType> = {
  "auth-login": {
    title: "Login Success",
    description: "Welcome!",
    variant: "success",
  },
  "auth-logout": {
    title: "Logout Success",
    description: "See you!",
    variant: "success",
  },
  "fail-generic": {
    title: "Oops!",
    description: "Something went wrong.",
    variant: "danger",
  },
  "fail-get": {
    title: "Oops!",
    description: "Data could not be fetched.",
    variant: "danger",
  },
  "fail-post": {
    title: "Oops!",
    description: "Data could not be updated.",
    variant: "danger",
  },
  "fail-no-permission": {
    title: "No Permission",
    description: "You have insufficient permission to access this content.",
    variant: "danger",
  },
  "fail-post-banned-user": {
    title: "You are not allowed to do that.",
    description: "You cannot perform this action because you are banned.",
    variant: "danger",
  },
  "feat-follow": {
    title: "Event Followed",
    description:
      "You'll receive updates about the event from the notifications.",
    variant: "success",
  },
  "feat-unfollow": {
    title: "Event Unfollowed",
    description: "You'll no longer receive notifications about the event.",
    variant: "success",
  },
  "feat-event-create": {
    title: "Event Created",
    description: "",
    variant: "success",
  },
  "feat-event-update": {
    title: "Event Updated",
    description: "",
    variant: "success",
  },
  "feat-event-delete": {
    title: "Event Deleted",
    description: "",
    variant: "success",
  },
  "feat-report-create": {
    title: "Report Submitted",
    description: "Thank you for the repot━an admin will take care of it.",
    variant: "success",
  },
  "feat-report-update": {
    title: "Event Followed",
    description:
      "You'll receive updates about the event from the notifications.",
    variant: "success",
  },
  "feat-report-delete": {
    title: "Report Deleted",
    description: "",
    variant: "success",
  },
  "feat-user-ban": {
    title: "User Banned",
    description: "",
    variant: "success",
  },
  "feat-user-unban": {
    title: "Report Unbanned",
    description: "",
    variant: "success",
  },
};
