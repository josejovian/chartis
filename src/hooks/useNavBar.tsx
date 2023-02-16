import { NavBarContext } from "@/contexts";
import { useContext, useMemo } from "react";

export function useNavBar() {
  const params = useContext(NavBarContext);
  return useMemo(() => params, [params]);
}
