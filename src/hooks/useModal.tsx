import { ModalViewEvent } from "@/components";
import { useCallback, useContext, useMemo } from "react";
import { ModalContext } from "@/contexts";
import { EventType } from "@/types";

export function useModal() {
  const params = useContext(ModalContext);
  const setModal = params[1];

  const showEvent = useCallback(
    (event: EventType) => {
      setModal(<ModalViewEvent event={event} />);
    },
    [setModal]
  );

  return useMemo(
    () => ({
      params,
      showEvent,
    }),
    [params, showEvent]
  );
}
