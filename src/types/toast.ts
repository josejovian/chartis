export type ToastVariantType = "danger" | "success";

export type ToastPresetType =
  | "fail-generic"
  | "fail-get"
  | "fail-post"
  | "fail-no-permission"
  | "fail-post-banned-user"
  | "auth-login"
  | "auth-logout"
  | "feat-follow"
  | "feat-unfollow"
  | "feat-event-create"
  | "feat-event-update"
  | "feat-event-delete"
  | "feat-report-create"
  | "feat-report-update"
  | "feat-report-delete"
  | "feat-user-ban"
  | "feat-user-unban";

export type ToastFunctionType = (toast: ToastLiveType[]) => ToastLiveType[];

export interface ToastContextPropsType {
  toasts: ToastLiveType[];
  setToasts: (toasts: ToastFunctionType) => void;
  addToast: (toast: ToastType) => void;
  addToastPreset: (preset: ToastPresetType) => void;
}

export interface ToastType {
  title: string;
  description: string;
  variant: ToastVariantType;
}

export interface ToastLiveType extends ToastType {
  id: string;
  createdAt: number;
  time: number;
  preExpire?: boolean;
  expire?: boolean;
}
