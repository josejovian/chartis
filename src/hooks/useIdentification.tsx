import { IdentificationContext } from "@/contexts";
import { useContext, useMemo } from "react";

export function useIdentification() {
  const stateIdentification = useContext(IdentificationContext);

  return useMemo(
    () => ({
      stateIdentification,
    }),
    [stateIdentification]
  );
}
