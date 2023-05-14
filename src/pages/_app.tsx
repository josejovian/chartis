import type { AppProps } from "next/app";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Unsubscribe, doc, onSnapshot } from "firebase/firestore";
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
  NotificationData,
} from "@/types";
import { useNavBar, useNotification } from "@/hooks";
import { useRouter } from "next/router";

const lato = Lato({ subsets: ["latin"], weight: ["400", "700", "900"] });

export default function App({ Component, pageProps }: AppProps) {
  const stateNavBar = useState(false);
  const [navBar, setNavBar] = stateNavBar;
  const stateModal = useState<ReactNode>(null);
  const [modal, setModal] = stateModal;
  const stateEventsObject = useState({});
  const stateIdentification = useState<IdentificationType>({
    authUser: null,
    user: null,
    users: {},
    initialized: false,
  });
  const stateSubscribedIds = useState<Record<string, number>>({});
  const setSubscribedIds = stateSubscribedIds[1];
  const [identification, setIdentification] = stateIdentification;
  const { user } = identification;
  const [screen, setScreen] = useState<ScreenSizeType>({
    width: 0,
    type: "mobile",
  });
  const initialize = useRef(false);
  const initializeListener = useRef(false);
  const [toasts, setToasts] = useState<ToastLiveType[]>([]);
  const stateNotification = useState<NotificationData[]>([]);
  const setNotification = stateNotification[1];
  const toastCount = useRef(0);
  const auth = getAuth();
  const listenerRef = useRef<Unsubscribe>();
  const { handleUpdateNotifications } = useNotification();
  const { togglable } = useNavBar({
    screen,
  });
  const router = useRouter();

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
      let userData: UserType | undefined;
      let newUsers = {};

      if (user) {
        userData = await readData(FIREBASE_COLLECTION_USERS, user.uid);

        if (userData) {
          userData = {
            ...userData,
            id: user.uid,
          };
          newUsers = {
            [user.uid]: {
              ...userData,
              id: user.uid,
            },
          };
        }

        setSubscribedIds(userData?.subscribedEvents ?? {});
      }

      setIdentification((prev) => ({
        ...prev,
        authUser: user,
        user: userData,
        users: {
          ...prev.users,
          ...newUsers,
        },
        initialized: true,
      }));
    });
  }, [auth, setIdentification, setSubscribedIds]);

  const handleAdjustNavbar = useCallback(() => {
    setNavBar(!togglable);
  }, [setNavBar, togglable]);

  const renderShadeNavBar = useMemo(
    () => (
      <>
        {togglable && navBar && (
          <div
            className="fixed left-0 top-0 w-screen h-screen z-20 bg-slate-900 opacity-50"
            onClick={() => {
              setNavBar(false);
            }}
          />
        )}
      </>
    ),
    [navBar, setNavBar, togglable]
  );

  const renderShadeModal = useMemo(
    () =>
      modal &&
      (modal as JSX.Element).type && (
        <div
          className={clsx(
            "fixed left-0 top-0 w-screen h-screen",
            "flex items-center justify-center z-40"
          )}
        >
          <div
            className="w-screen h-screen z-40 bg-black opacity-80"
            onClick={() => {
              setModal(null);
            }}
          />
          <Modal content={modal} />
        </div>
      ),
    [modal, setModal]
  );

  const handleListenForUpdates = useCallback(() => {
    if (user && !initializeListener.current) {
      initializeListener.current = true;

      const { subscribedEvents = {} } = user;
      const subscribedEventIds = Object.keys(subscribedEvents);

      const listener = onSnapshot(
        doc(fs, FIREBASE_COLLECTION_USERS, user.id),
        async (doc) => {
          const newUser = doc.data();
          if (newUser) {
            const { unseenEvents = {} } = newUser as UserType;
            if (
              Object.entries(unseenEvents).length > 0 &&
              subscribedEventIds.length > 0
            ) {
              const newNotifs = await handleUpdateNotifications(
                newUser as UserType
              );
              if (newNotifs) setNotification(newNotifs);
            }
          }
        }
      );

      listenerRef.current = listener;

      return listener;
    }
    return null;
  }, [handleUpdateNotifications, setNotification, user]);

  // notification listener
  useEffect(() => {
    const listener = handleListenForUpdates();
    return () => {
      if (listener) listener();
    };
  }, [handleListenForUpdates, identification, user]);

  useEffect(() => {
    handleAdjustNavbar();
  }, [handleAdjustNavbar, screen, router]);

  const handleInitialize = useCallback(() => {
    if (initialize.current) return;
    window.addEventListener("resize", handleUpdateScreen);
    window.addEventListener("beforeunload", () => {
      if (listenerRef.current) listenerRef.current();
    });
    handleUpdateScreen();
    initialize.current = true;

    handleUpdateLoggedInUserData();
  }, [handleUpdateLoggedInUserData, handleUpdateScreen]);

  useEffect(() => {
    handleInitialize();
  }, [handleInitialize]);

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
        eventsProps={{
          stateEventsObject,
        }}
        notificationProps={{
          stateNotification,
          stateSubscribedIds,
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
