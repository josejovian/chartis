import { useContext, useMemo } from "react";
import { NotificationContext } from "@/contexts";

export function useNotification() {
  const { stateUpdates } = useContext(NotificationContext);
  const [updates, setUpdates] = stateUpdates;

  return useMemo(
    () => ({
      updates,
      setUpdates,
    }),
    [setUpdates, updates]
  );
}
