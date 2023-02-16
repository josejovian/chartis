import type { AppProps } from "next/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import { Lato } from "@next/font/google";
import clsx from "clsx";
import { LayoutNavbar } from "@/components";
import {
  NavBarContext,
  ScreenContext,
  SCREEN_CONTEXT_DEFAULT,
} from "@/contexts";
import { ScreenSizeCategoryType, ScreenSizeType } from "@/types";
import {
  DESKTOP_SMALL_SCREEN_THRESHOLD,
  MOBILE_SCREEN_THRESHOLD,
} from "@/consts";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
  const stateNavBar = useState(false);
  const [navBar, setNavBar] = stateNavBar;
  const [screen, setScreen] = useState<ScreenSizeType>(SCREEN_CONTEXT_DEFAULT);
  const initialize = useRef(false);

  const handleUpdateScreen = useCallback(() => {
    const width = window.innerWidth;

    const type: ScreenSizeCategoryType = (() => {
      if (width >= DESKTOP_SMALL_SCREEN_THRESHOLD) return "desktop_lg";
      if (width >= MOBILE_SCREEN_THRESHOLD) return "desktop_sm";
      return "mobile";
    })();

    setScreen({
      width,
      type,
    });
  }, []);

  const handleInitialize = useCallback(() => {
    if (initialize.current) return;
    window.addEventListener("resize", handleUpdateScreen);
    handleUpdateScreen();
    initialize.current = true;
  }, [handleUpdateScreen]);

  const handleAdjustNavbar = useCallback(() => {
    if (screen.type === "desktop_lg") {
      setNavBar(true);
    } else {
      setNavBar(false);
    }
  }, [screen, setNavBar]);

  const renderShade = useMemo(
    () => (
      <>
        {screen.type !== "desktop_lg" && navBar && (
          <div
            className="fixed left-0 top-0 w-screen h-screen z-20 bg-slate-900 opacity-50"
            onClick={() => {
              setNavBar(false);
            }}
          />
        )}
      </>
    ),
    [navBar, screen.type, setNavBar]
  );

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

  useEffect(() => {
    handleAdjustNavbar();
  }, [handleAdjustNavbar, screen]);

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${lato.style.fontFamily};
        }
      `}</style>
      <NavBarContext.Provider value={stateNavBar}>
        <ScreenContext.Provider value={screen}>
          <div id="App" className={clsx("flex flex-row")}>
            {renderShade}
            <LayoutNavbar stateNavBar={stateNavBar} />
            <div className={clsx(screen.type === "mobile" && "mt-16")}>
              <Component {...pageProps} />
            </div>
          </div>
        </ScreenContext.Provider>
      </NavBarContext.Provider>
    </>
  );
}
