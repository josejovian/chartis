import { IdentificationContext } from "@/contexts";
import { useCallback, useContext, useMemo } from "react";

export function useIdentification() {
  const stateIdentification = useContext(IdentificationContext);

  return useMemo(
    () => ({
      stateIdentification,
    }),
    [stateIdentification]
  );
}
