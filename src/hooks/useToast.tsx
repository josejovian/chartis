import { useContext, useMemo } from "react";
import { ToastContext } from "@/contexts";

export function useToast() {
  const { addToast, addToastPreset } = useContext(ToastContext);

  return useMemo(
    () => ({
      addToast,
      addToastPreset,
    }),
    [addToast, addToastPreset]
  );
}
