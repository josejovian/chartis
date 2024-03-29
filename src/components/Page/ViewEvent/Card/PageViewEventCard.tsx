/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Router, useRouter } from "next/router";
import { Formik, type FormikTouched } from "formik";
import pushid from "pushid";
import {
  LayoutCard,
  PageViewEventFoot,
  PageViewEventCardUpdatesTab,
  PageViewEventCardDiscussionTab,
  LayoutNotice,
  PageViewEventCardDetailTab,
  PageViewEventHead,
  User,
  EventButtonFollow,
  EventButtonMore,
  ModalConfirmation,
} from "@/components";
import { useModal, useReport, useToast } from "@/hooks";
import {
  createEvent,
  deleteEvent,
  getLocalTimeInISO,
  getTimeDifference,
  sleep,
  updateEvent,
  validateEndDate,
  validateEventDescription,
  validateEventName,
  validateImage,
  validateLocation,
  validateOrganizer,
  validateStartDate,
  validateTags,
} from "@/utils";
import {
  EventType,
  EventModeType,
  ScreenSizeCategoryType,
  StateObject,
  EventCardTabNameType,
  IdentificationType,
} from "@/types";
import { EVENT_EMPTY } from "@/consts";
import clsx from "clsx";
import { Icon, Popup } from "semantic-ui-react";

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  stateIdentification: StateObject<IdentificationType>;
  width: number;
  type: ScreenSizeCategoryType;
  updateUserSubscribedEventClientSide: (
    eventId: string,
    version?: number
  ) => void;
  subscribed?: boolean;
  updateClientSideEvent: (eventId: string, event: Partial<EventType>) => void;
  eventPreviousValues?: MutableRefObject<EventType>;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  stateIdentification,
  width,
  type,
  updateUserSubscribedEventClientSide,
  updateClientSideEvent,
  eventPreviousValues,
  subscribed,
}: ModalViewEventProps) {
  const router = useRouter();
  const { asPath, query } = router;
  const stateFocusThumbnail = useState(true);
  const focusThumbnail = stateFocusThumbnail[0];
  const [event, setEvent] = stateEvent;
  const { authorId, name, postDate, hide } = event;
  const [mode, setMode] = stateMode;
  const stateTags = useState((event && event.tags) ?? []);
  const [tags, setTags] = stateTags;
  const stateSubmitting = useState(false);
  const setSubmitting = stateSubmitting[1];
  const stateDeleting = useState(false);
  const setDeleting = stateDeleting[1];
  const stateActiveTab = useState<EventCardTabNameType>("detail");
  const [activeTab, setActiveTab] = stateActiveTab;
  const stateLoading = useState(false);
  const loading = stateLoading[0];
  const formTouched = useRef<Partial<Record<keyof EventType, boolean>>>({});
  const formValidateAll = useRef(false);

  const { addToast, addToastPreset } = useToast();
  const stateModalDelete = useState(false);
  const [, setModalDelete] = stateModalDelete;

  const identification = stateIdentification[0];
  const { user, initialized } = identification;
  const [cardHeight, setCardHeight] = useState(0);
  const { showReportModal } = useReport();
  const { setModal, clearModal } = useModal();

  const authorized = useMemo(() => {
    if (!initialized) return undefined;

    return Boolean(user && !user?.ban);
  }, [initialized, user]);

  const initialEventData = useMemo(() => {
    if (!event || mode === "create") return EVENT_EMPTY;

    const object: any = Object.keys(EVENT_EMPTY).reduce(
      (prev, curr) => ({
        ...prev,
        [curr]: event[curr as keyof EventType],
      }),
      EVENT_EMPTY
    );

    if (object.startDate)
      object.startDate = getLocalTimeInISO(object.startDate);

    if (object.endDate) object.endDate = getLocalTimeInISO(object.endDate);

    return object;
  }, [event, mode]);

  const handleUpdateClientSideEvent = useCallback(
    (eventId: string, eventData: Partial<EventType>) => {
      updateClientSideEvent(eventId, eventData);
      setEvent((prev) => ({
        ...prev,
        ...eventData,
      }));
    },
    [setEvent, updateClientSideEvent]
  );

  const handleConstructEventValues = useCallback(
    (values: unknown) => {
      if (!user) return null;

      const { startDate, endDate } = values as EventType;
      const eventId = mode === "create" ? pushid() : event.id;

      const newEvent: EventType = {
        ...event,
        ...(values as EventType),
        id: eventId,
        authorId: user.id,
        tags,
      };

      newEvent.startDate = new Date(startDate).getTime();

      if (endDate) newEvent.endDate = new Date(endDate).getTime();
      else delete newEvent.endDate;

      return {
        newEvent,
        eventId,
      };
    },
    [event, mode, tags, user]
  );

  const handleFailedSubmit = useCallback(() => {
    if (!user) return;
    addToastPreset(user.ban ? "fail-post-banned-user" : "fail-post");
    setSubmitting(false);
  }, [addToastPreset, setSubmitting, user]);

  const handleSubmitForm = useCallback(
    async (values: any) => {
      const data = handleConstructEventValues(values);

      if (!user || !data) return;

      setSubmitting(true);

      const { newEvent, eventId } = data;
      await sleep(200);

      if (mode === "create") {
        createEvent(newEvent)
          .then(() => {
            sleep(200).then(() => {
              addToastPreset("feat-event-create");
              router.replace(`/event/${eventId}?commit=true`);
            });
          })
          .catch(() => {
            addToastPreset("fail-post");
            setSubmitting(false);
          });
      } else if (eventPreviousValues && eventPreviousValues.current) {
        const {
          newEvent: {
            description,
            name,
            startDate,
            endDate,
            organizer,
            tags,
            location,
          },
        } = data;
        const {
          description: oldDesc,
          name: oldName,
          startDate: oldStartDate,
          endDate: oldEndDate,
          location: oldLocation,
          organizer: oldOrg,
          tags: oldTags,
        } = eventPreviousValues.current;

        if (
          description === oldDesc &&
          name === oldName &&
          startDate === oldStartDate &&
          endDate === oldEndDate &&
          location === oldLocation &&
          organizer === oldOrg &&
          tags === oldTags
        ) {
          addToastPreset("feat-event-update-fail");
          setSubmitting(false);
          return;
        }

        updateEvent(
          eventPreviousValues.current.id,
          eventPreviousValues.current,
          newEvent,
          user.id
        )
          .then(async (result) => {
            await sleep(200);
            router.replace(`/event/${event.id}?commit=true`);
            addToastPreset("feat-event-update");
            setMode("view");
            setEvent(result);
            setSubmitting(false);
            if (eventPreviousValues && eventPreviousValues.current)
              eventPreviousValues.current = result;
          })
          .catch(() => {
            handleFailedSubmit();
          });
      }
    },
    [
      addToastPreset,
      event.id,
      eventPreviousValues,
      handleConstructEventValues,
      handleFailedSubmit,
      mode,
      router,
      setEvent,
      setMode,
      setSubmitting,
      user,
    ]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!event.id) return;

    setDeleting(true);

    await sleep(200);

    await deleteEvent(event.id).then(() => {
      addToastPreset("feat-event-delete");
      setModalDelete(false);
      setDeleting(false);

      if (router.asPath.includes("/event/")) router.push("/");
    });
  }, [addToastPreset, event.id, router, setDeleting, setModalDelete]);

  const handleValidateExtraForm = useCallback(
    (values: any) => {
      const {
        name,
        description,
        startDate,
        endDate,
        thumbnailSrc,
        organizer,
        location,
      } = values;

      const result = {
        name:
          formValidateAll.current || formTouched.current.name
            ? validateEventName(name)
            : undefined,
        description:
          formValidateAll.current || formTouched.current.description
            ? validateEventDescription(description)
            : undefined,
        location: validateLocation(location),
        organizer: validateOrganizer(organizer),
        startDate: validateStartDate(startDate),
        endDate: validateEndDate(startDate, endDate),
        tags: validateTags(tags),
        thumbnailSrc: validateImage(thumbnailSrc),
      };

      if (result.thumbnailSrc) {
        addToast({
          title: "Image Invalid",
          description: result.thumbnailSrc,
          variant: "danger",
        });
      }

      if (Object.values(result).filter((entry) => entry).length === 0)
        return {};

      return result;
    },
    [addToast, tags]
  );

  const handleLeaveEdit = useCallback(() => {
    router.replace(`/event/${event.id}?commit=true`, undefined, {});
    setMode("view");
  }, [event.id, router, setMode]);

  const renderCardActiveContentTab = useCallback(
    ({
      validateForm,
      setFieldValue,
      values,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
      setFieldValue?: (
        field: string,
        value: any,
        shouldValidate?: boolean | undefined
      ) => void;
      values: any;
    }) => {
      switch (activeTab) {
        case "detail":
          return (
            <PageViewEventCardDetailTab
              event={event}
              type={type}
              mode={mode}
              stateTags={stateTags}
              validateForm={validateForm}
              setFieldValue={setFieldValue}
              values={values}
            />
          );
        case "updates":
          return <PageViewEventCardUpdatesTab type={type} event={event} />;
        case "discussion":
          return (
            <PageViewEventCardDiscussionTab
              type={type}
              stateEvent={stateEvent}
              identification={identification}
            />
          );
      }
    },
    [activeTab, event, identification, mode, stateEvent, stateTags, type]
  );

  const handleEdit = useCallback(() => {
    const { pathname, query } = router;
    setActiveTab("detail");
    setMode("edit");

    router.replace(
      {
        pathname,
        query: {
          ...query,
          mode: "edit",
        },
      },
      undefined,
      { shallow: true }
    );
  }, [router, setActiveTab, setMode]);

  const handleReport = useCallback(() => {
    showReportModal({
      eventId: event.id,
      authorId: event.authorId,
      contentType: "event",
      reportedBy: user ? user.id : "",
    });
  }, [event.authorId, event.id, showReportModal, user]);

  const renderActionTabs = useMemo(
    () => (
      <div
        className={clsx("flex items-between align-self-end !h-fit gap-4")}
        style={{ paddingTop: "0.32rem" }}
      >
        <EventButtonFollow
          event={event}
          identification={identification}
          updateUserSubscribedEventClientSide={
            updateUserSubscribedEventClientSide
          }
          defaultSubscribed={subscribed}
          updateClientSideEvent={handleUpdateClientSideEvent}
          size={type === "mobile" ? "tiny" : undefined}
        />
        <EventButtonMore
          event={event}
          identification={identification}
          size={type === "mobile" ? "tiny" : undefined}
          stateDeleting={stateDeleting}
          stateModalDelete={stateModalDelete}
          onEdit={handleEdit}
          onDelete={handleDeleteEvent}
          onReport={handleReport}
          updateClientSideEvent={handleUpdateClientSideEvent}
        />
      </div>
    ),
    [
      event,
      identification,
      updateUserSubscribedEventClientSide,
      subscribed,
      handleUpdateClientSideEvent,
      type,
      stateDeleting,
      stateModalDelete,
      handleEdit,
      handleDeleteEvent,
      handleReport,
    ]
  );

  const renderEventTitle = useMemo(
    () =>
      mode === "view" && (
        <div
          className={clsx(
            "flex flex-wrap justify-between py-3 px-12 gap-2 shadow-md z-10",
            type === "mobile" && "!px-6"
          )}
        >
          <div>
            <span className="text-14px text-secondary-4">
              Posted by{" "}
              <b>
                <User id={authorId} type="name" />
              </b>{" "}
              {getTimeDifference(postDate)}
            </span>
            <h2
              className={clsx(
                "h2 text-secondary-7",
                hide && "text-secondary-5",
                type === "mobile" && "!text-18px !leading-7"
              )}
            >
              {hide && (
                <Popup
                  trigger={
                    <Icon name="eye slash" className="text-secondary-5 !mr-2" />
                  }
                  content="Hidden"
                  size="tiny"
                  offset={[-20, 0]}
                  basic
                  inverted
                />
              )}
              {name}
            </h2>
          </div>
          {renderActionTabs}
        </div>
      ),
    [authorId, hide, mode, name, postDate, renderActionTabs, type]
  );

  const renderCardContents = useCallback(
    ({
      submitForm,
      validateForm,
      setFieldValue,
      values,
      touched,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
      setFieldValue?: (
        field: string,
        value: any,
        shouldValidate?: boolean | undefined
      ) => void;
      touched?: FormikTouched<EventType>;
      values?: any;
    }) => {
      const activeTabContent = renderCardActiveContentTab({
        submitForm,
        validateForm,
        setFieldValue,
        values,
      });

      if (touched) formTouched.current = touched as any;

      return (
        <>
          <PageViewEventHead
            event={event}
            type={type}
            stateActiveTab={stateActiveTab}
            stateDeleting={stateDeleting}
            stateModalDelete={stateModalDelete}
            stateMode={stateMode}
            stateIdentification={stateIdentification}
            onDelete={handleDeleteEvent}
            updateUserSubscribedEventClientSide={
              updateUserSubscribedEventClientSide
            }
            cardHeight={cardHeight}
            stateFocused={stateFocusThumbnail}
            stateLoading={stateLoading}
            setFieldValue={setFieldValue}
          />
          {renderEventTitle}
          {activeTabContent}
          <PageViewEventFoot
            event={event}
            stateSubmitting={stateSubmitting}
            stateMode={stateMode}
            onLeaveEdit={handleLeaveEdit}
            submitForm={() => {
              formValidateAll.current = true;
              submitForm && submitForm();
            }}
          />
        </>
      );
    },
    [
      renderCardActiveContentTab,
      event,
      type,
      stateActiveTab,
      stateDeleting,
      stateModalDelete,
      stateMode,
      stateIdentification,
      handleDeleteEvent,
      updateUserSubscribedEventClientSide,
      cardHeight,
      stateFocusThumbnail,
      stateLoading,
      renderEventTitle,
      stateSubmitting,
      handleLeaveEdit,
    ]
  );

  const handleUpdateTagsOnEditMode = useCallback(() => {
    if (mode === "edit" && event) {
      setTags(event.tags);
    }
  }, [event, mode, setTags]);

  useEffect(() => {
    handleUpdateTagsOnEditMode();
  }, [handleUpdateTagsOnEditMode]);

  const handleInitializeHeight = useCallback(() => {
    const card = document.getElementsByClassName("EventCardWrapper")[0];

    if (card) {
      const realHeight = card.getBoundingClientRect().height;
      setCardHeight(realHeight);
    }
  }, []);

  useEffect(() => {
    handleInitializeHeight();
  });

  const handleInterceptRoute = useCallback(
    (destination: any) => {
      if (
        Object.keys(formTouched.current).length > 0 &&
        (asPath.includes("new") || query.mode === "edit") &&
        !destination.includes("commit=true")
      ) {
        Router.events.emit("routeChangeError");

        const temp = { ...query };
        delete temp.mode;

        setModal(
          <div
            className={clsx(
              "ui modal transition visible overflow-visible active",
              "!static ModifiedModal"
            )}
          >
            <ModalConfirmation
              onCancel={() => {
                clearModal();
              }}
              onConfirm={() => {
                router.replace(`${destination}?commit=true`);
                clearModal();
              }}
              modalHeader={
                asPath.includes("new")
                  ? "Leave Creating Event?"
                  : "Leave Editing Event?"
              }
              modalText={
                asPath.includes("new")
                  ? "Your progress will not be saved, and you will have to start over. Leave anyway?"
                  : "The changes will not be saved, and you will have to start over. Leave anyway?"
              }
              confirmText="Leave"
              cancelText="Stay"
              contentsOnly
            />
          </div>
        );

        throw Error("Intercepted!");
      }
    },
    [asPath, clearModal, query, router, setModal]
  );

  const handleInterceptUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (
        Object.keys(formTouched.current).length > 0 &&
        (asPath.includes("new") || query.mode === "edit")
      ) {
        (e || window.event).returnValue = "change";
        return "change";
      }
    },
    [asPath, query.mode]
  );

  useEffect(() => {
    Router.events.on("routeChangeStart", handleInterceptRoute);
    window.addEventListener("beforeunload", handleInterceptUnload);

    return () => {
      Router.events.off("routeChangeStart", handleInterceptRoute);
      window.removeEventListener("beforeunload", handleInterceptUnload);
    };
  }, [handleInterceptRoute, handleInterceptUnload]);

  const renderPage = useMemo(
    () =>
      mode === "view" ? (
        <LayoutCard className={clsx(className, !focusThumbnail && "!h-full")}>
          {renderCardContents({})}
        </LayoutCard>
      ) : (
        <Formik
          initialValues={initialEventData}
          validate={handleValidateExtraForm}
          validateOnBlur
          onSubmit={handleSubmitForm}
          validateOnChange
        >
          {/** @todos Submit button seems to not work unless you do this. */}
          {({ submitForm, validateForm, setFieldValue, touched, values }) => (
            <LayoutCard
              className={clsx(className, !focusThumbnail && "!h-full")}
              form
            >
              {renderCardContents({
                submitForm,
                validateForm,
                setFieldValue,
                values,
                touched,
              })}
            </LayoutCard>
          )}
        </Formik>
      ),
    [
      className,
      focusThumbnail,
      handleSubmitForm,
      handleValidateExtraForm,
      initialEventData,
      mode,
      renderCardContents,
    ]
  );

  return loading || authorized === undefined ? (
    <LayoutNotice preset="loader" />
  ) : mode === "view" || authorized ? (
    <div className="EventCardWrapper">{renderPage}</div>
  ) : (
    <LayoutNotice
      title="No Access"
      description="You are not allowed to post contents because you are banned."
    />
  );
}
