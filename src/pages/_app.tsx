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
  EventUpdateNameType,
  EventUpdateType,
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
  const stateUpdates = useState<EventUpdateBatchType[]>([]);
  const setUpdates = stateUpdates[1];
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

  const handleUpdateNotifications = useCallback(() => {
    if (!user || initializeListener.current) return null;

    initializeListener.current = true;

    const { subscribedEvents = {} } = users[user.uid];
    const subscribedEventIds = Object.keys(subscribedEvents);

    return onSnapshot(
      doc(fs, FIREBASE_COLLECTION_USERS, user.uid),
      async (doc) => {
        const userDoc = doc.data();

        if (userDoc) {
          const { notificationCount = 0 } = userDoc as UserType;
          const notificationUpdates: EventUpdateBatchType[] = [];

          if (notificationCount > 0 && subscribedEventIds.length > 0) {
            for (const eventId of subscribedEventIds) {
              const lastSeenVersion = subscribedEvents[eventId];
              const newEvent = await readData("events", eventId);
              if (
                newEvent &&
                newEvent.version &&
                newEvent.version > lastSeenVersion
              ) {
                const eventUpdates = await readData("updates", eventId);

                if (eventUpdates) {
                  const unseenBatches =
                    eventUpdates.updates.slice(lastSeenVersion);

                  const unseenUpdates: Partial<
                    Record<EventUpdateNameType, EventUpdateType>
                  > = {};

                  const lastBatch = unseenBatches[unseenBatches.length - 1];

                  unseenBatches
                    .map((batch) => batch.updates)
                    .forEach((batchUpdate) => {
                      (
                        Object.entries(batchUpdate) as [
                          EventUpdateNameType,
                          EventUpdateType
                        ][]
                      ).forEach(([type, changes]) => {
                        if (!unseenUpdates[type]) {
                          unseenUpdates[type] = {
                            ...changes,
                          };
                        } else {
                          unseenUpdates[type] = {
                            ...unseenUpdates[type],
                            valueNew: changes.valueNew,
                          };
                        }
                      });
                    });

                  notificationUpdates.push({
                    ...lastBatch,
                    eventId: newEvent.id,
                    version: newEvent.version,
                    updates: unseenUpdates as Record<
                      EventUpdateNameType,
                      EventUpdateType
                    >,
                  });
                }
              }
            }

            notificationUpdates.sort((a, b) => {
              if (a.date > b.date) {
                return -1;
              }
              if (a.date < b.date) {
                return 1;
              }
              return 0;
            });
          }

          setUpdates(notificationUpdates);
        }
      }
    );
  }, [setUpdates, user, users]);

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

  useEffect(() => {
    const notification = handleUpdateNotifications();
    return () => {
      if (notification) notification();
    };
  }, [identification, handleUpdateNotifications]);

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
          stateUpdates,
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
