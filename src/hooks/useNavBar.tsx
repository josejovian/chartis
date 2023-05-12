import { NavBarContext } from "@/contexts";
import { useRouter } from "next/router";
import { useContext, useMemo } from "react";
import { ScreenSizeType } from "@/types";

interface useNavBarProps {
  screen: ScreenSizeType;
}

export function useNavBar({ screen }: useNavBarProps) {
  const { type } = screen;
  const stateNavBar = useContext(NavBarContext);
  const route = useRouter();

  const togglable = useMemo(() => {
    if (route.asPath === "/") {
      return type !== "desktop_lg";
    } else {
      return type === "mobile";
    }
  }, [route.asPath, type]);

  return useMemo(
    () => ({
      stateNavBar,
      togglable,
    }),
    [stateNavBar, togglable]
  );
}
