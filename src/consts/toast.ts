import { ToastPresetType, ToastType } from "@/types";

export const TOAST_PRESETS: Record<ToastPresetType, ToastType> = {
  "generic-fail": {
    title: "Oops!",
    description: "Something went wrong.",
    variant: "danger",
  },
  "get-fail": {
    title: "Oops!",
    description: "Data could not be fetched.",
    variant: "danger",
  },
  "post-fail": {
    title: "Oops!",
    description: "Data could not be updated.",
    variant: "danger",
  },
};
