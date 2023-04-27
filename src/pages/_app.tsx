import type { AppProps } from "next/app";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fs, readData } from "@/firebase";
import "@/styles/globals.css";
import "semantic-ui-css/semantic.min.css";
import { Lato } from "@next/font/google";
import clsx from "clsx";
import { LayoutNavbar, Modal, ToastWrapper } from "@/components";
import { ContextWrapper } from "@/contexts";
import {
  DESKTOP_SMALL_SCREEN_THRESHOLD,
  FIREBASE_COLLECTION_USERS,
  MOBILE_SCREEN_THRESHOLD,
  TOAST_PRESETS,
} from "@/consts";
import {
  ScreenSizeCategoryType,
  ScreenSizeType,
  IdentificationType,
  ToastLiveType,
  ToastType,
  ToastPresetType,
  UserType,
  EventUpdateBatchType,
} from "@/types";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
  const stateNavBar = useState(false);
  const [navBar, setNavBar] = stateNavBar;
  const stateModal = useState<ReactNode>(null);
  const [modal, setModal] = stateModal;
  const stateIdentification = useState<IdentificationType>({
    user: null,
    users: {},
    permission: "guest",
  });
  const [identification, setIdentification] = stateIdentification;
  const { user, users } = identification;
  const [screen, setScreen] = useState<ScreenSizeType>({
    width: 0,
    type: "mobile",
  });
  const initialize = useRef(false);
  const initializeListener = useRef(false);
  const [toasts, setToasts] = useState<ToastLiveType[]>([]);
  const staetNotification = useState<EventUpdateBatchType[]>([]);
  const setNotification = staetNotification[1];
  const toastCount = useRef(0);
  const auth = getAuth();

  const handleAddToast = useCallback((toast: ToastType) => {
    toastCount.current++;
    setToasts((prev) => [
      ...prev,
      {
        ...toast,
        id: `Toast-${toastCount.current}`,
        createdAt: new Date().getTime(),
        time: 4,
      } as ToastLiveType,
    ]);
  }, []);

  const handleAddToastPreset = useCallback(
    (preset: ToastPresetType) => {
      handleAddToast(TOAST_PRESETS[preset]);
    },
    [handleAddToast]
  );

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

  const handleUpdateLoggedInUserData = useCallback(async () => {
    onAuthStateChanged(auth, async (user) => {
      let userData = null;
      let newUsers = {};

      if (user) {
        userData = await readData(FIREBASE_COLLECTION_USERS, user.uid).catch(
          () => null
        );

        if (userData) {
          newUsers = {
            [user.uid]: userData,
          };
        }
      }

      setIdentification((prev) => ({
        ...prev,
        user,
        permission: user ? "user" : "guest",
        users: {
          ...prev.users,
          ...newUsers,
        },
      }));
    });
  }, [auth, setIdentification]);

  const handleInitialize = useCallback(() => {
    if (initialize.current) return;
    window.addEventListener("resize", handleUpdateScreen);
    handleUpdateScreen();
    initialize.current = true;

    handleUpdateLoggedInUserData();
  }, [handleUpdateLoggedInUserData, handleUpdateScreen]);

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
        <div
          className={clsx(
            "fixed left-0 top-0 w-screen h-screen",
            "flex items-center justify-center z-40"
          )}
        >
          <div
            className="w-screen h-screen z-40 bg-black opacity-80"
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

  // notification listener
  useEffect(() => {
    if (user && !initializeListener.current) {
      initializeListener.current = true;

      const { subscribedEvents = {} } = users[user.uid];
      const subscribedEventIds = Object.keys(subscribedEvents);

      return onSnapshot(
        doc(fs, FIREBASE_COLLECTION_USERS, user.uid),
        async (doc) => {
          if (doc.data()) {
            const { unseenEvents = {} } = doc.data() as UserType;
            if (
              Object.entries(unseenEvents).length > 0 &&
              subscribedEventIds.length > 0
            ) {
              const notifications = subscribedEventIds.map(
                (id): EventUpdateBatchType => ({
                  eventId: id,
                  lastSeenVersion: subscribedEvents[id],
                  unseen: unseenEvents[id],
                })
              );
              setNotification(notifications);
            }
          }
        }
      );
    }
  }, [identification, setNotification, user, users]);

  useEffect(() => {
    handleAdjustNavbar();
  }, [handleAdjustNavbar, screen]);

  return (
    <>
      <style jsx global>{`
        body *:not(.icon) {
          font-family: ${lato.style.fontFamily}!important;
        }
      `}</style>
      <ContextWrapper
        stateIdentification={stateIdentification}
        screen={screen}
        stateModal={stateModal}
        stateNavBar={stateNavBar}
        toastProps={{
          toasts,
          setToasts,
          addToast: handleAddToast,
          addToastPreset: handleAddToastPreset,
        }}
        notificationProps={{
          stateUpdates: staetNotification,
        }}
      >
        <div id="App" className={clsx("flex flex-row w-full h-full")}>
          {renderShadeNavBar}
          {renderShadeModal}
          <LayoutNavbar stateNavBar={stateNavBar} />
          <div className="flex flex-auto w-full h-full">
            <Component {...pageProps} />
          </div>
          <ToastWrapper />
        </div>
      </ContextWrapper>
    </>
  );
}
