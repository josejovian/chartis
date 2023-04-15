export type ToastVariantType = "danger" | "success";

export type ToastPresetType =
  | "generic-fail"
  | "get-fail"
  | "post-fail"
  | "follow"
  | "unfollow";

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
