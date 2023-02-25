import type { AppProps } from "next/app";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "@/styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import { Lato } from "@next/font/google";
import clsx from "clsx";
import { LayoutNavbar, Modal } from "@/components";
import { SCREEN_CONTEXT_DEFAULT, ContextWrapper } from "@/contexts";
import { ScreenSizeCategoryType, ScreenSizeType } from "@/types";
import {
  DESKTOP_SMALL_SCREEN_THRESHOLD,
  MOBILE_SCREEN_THRESHOLD,
} from "@/consts";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
  const stateNavBar = useState(false);
  const [navBar, setNavBar] = stateNavBar;
  const stateModal = useState<ReactNode>(null);
  const [modal, setModal] = stateModal;
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

  const handleInitialize = useCallback(async () => {
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

  const renderShadeNavBar = useMemo(
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

  const renderShadeModal = useMemo(
    () =>
      modal && (
        <div className="fixed left-0 top-0 flex items-center justify-center w-screen h-screen z-40">
          <div
            className="w-screen h-screen z-40 bg-slate-900 opacity-70"
            onClick={() => {
              setModal(false);
            }}
          />
          <Modal content={modal} />
        </div>
      ),
    [modal, setModal]
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
      <ContextWrapper
        screen={screen}
        stateModal={stateModal}
        stateNavBar={stateNavBar}
      >
        <div id="App" className={clsx("flex flex-row w-full")}>
          {renderShadeNavBar}
          {renderShadeModal}
          <LayoutNavbar stateNavBar={stateNavBar} />
          <div className="flex flex-auto w-full">
            <Component {...pageProps} />
          </div>
        </div>
      </ContextWrapper>
    </>
  );
}
