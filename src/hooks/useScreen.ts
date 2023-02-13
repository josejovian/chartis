import { ScreenContext } from "@/contexts";
import { useContext, useMemo } from "react";

export function useScreeh() {
  const params = useContext(ScreenContext);
  return useMemo(() => params, [params]);
}
