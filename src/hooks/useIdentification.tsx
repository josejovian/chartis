import { IdentificationContext } from "@/contexts";
import { useContext, useMemo } from "react";

export function useIdentification() {
  const params = useContext(IdentificationContext);

  return useMemo(() => params, [params]);
}
