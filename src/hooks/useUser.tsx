import { UserContext } from "@/contexts";
import { useContext, useMemo } from "react";

export function useUser() {
  const params = useContext(UserContext);

  return useMemo(() => params, [params]);
}
