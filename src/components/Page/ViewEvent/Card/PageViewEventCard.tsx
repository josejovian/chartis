/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import pushid from "pushid";
import {
  LayoutCard,
  PageViewEventFoot,
  PageViewEventCardUpdatesTab,
  PageViewEventCardDiscussionTab,
  LayoutNotice,
  PageViewEventCardDetailTab,
  PageViewEventHead,
} from "@/components";
import { useEvent, useToast } from "@/hooks";
import {
  SchemaEvent,
  getLocalTimeInISO,
  sleep,
  validateEndDate,
  validateImage,
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

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  stateIdentification: StateObject<IdentificationType>;
  width: number;
  type: ScreenSizeCategoryType;
  updateUserSubscribedEventClientSide: (
    userId: string,
    eventId: string,
    version?: number
  ) => void;
  eventPreviousValues?: MutableRefObject<EventType>;
  fancy?: boolean;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  stateIdentification,
  width,
  type,
  updateUserSubscribedEventClientSide,
  eventPreviousValues,
  fancy,
}: ModalViewEventProps) {
  const router = useRouter();
  const { updateEvent, createEvent, deleteEvent } = useEvent();
  const stateFocusThumbnail = useState(true);
  const focusThumbnail = stateFocusThumbnail[0];
  const [event, setEvent] = stateEvent;
  const [mode, setMode] = stateMode;
  const stateTags = useState((event && event.tags) ?? []);
  const [tags, setTags] = stateTags;
  const stateSubmitting = useState(false);
  const setSubmitting = stateSubmitting[1];
  const stateDeleting = useState(false);
  const setDeleting = stateDeleting[1];
  const stateActiveTab = useState<EventCardTabNameType>("detail");
  const activeTab = stateActiveTab[0];
  const stateLoading = useState(false);
  const loading = stateLoading[0];

  const { addToastPreset } = useToast();
  const stateModalDelete = useState(false);
  const [, setModalDelete] = stateModalDelete;

  const identification = stateIdentification[0];
  const { user, initialized } = identification;
  const [cardHeight, setCardHeight] = useState(0);

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

  const handleConstructEventValues = useCallback(
    async (values: unknown) => {
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

      const { newEvent, eventId } = (await data) as any;
      await sleep(200);

      if (mode === "create") {
        createEvent(newEvent)
          .then(() => {
            sleep(200).then(() => {
              addToastPreset("feat-event-create");
              router.push(`/event/${eventId}`);
            });
          })
          .catch((e) => {
            addToastPreset("fail-post");
            setSubmitting(false);
          });
      } else if (eventPreviousValues && eventPreviousValues.current) {
        updateEvent(
          eventPreviousValues.current.id,
          eventPreviousValues.current,
          newEvent,
          user.id
        )
          .then(async (result) => {
            await sleep(200);
            router.replace(`/event/${event.id}/`);
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
      createEvent,
      event.id,
      eventPreviousValues,
      handleConstructEventValues,
      handleFailedSubmit,
      mode,
      router,
      setEvent,
      setMode,
      setSubmitting,
      updateEvent,
      user,
    ]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!event.id) return;

    setDeleting(true);

    await sleep(200);

    await deleteEvent(event.id).then(() => {
      setModalDelete(false);
      setDeleting(false);
    });
  }, [deleteEvent, event.id, setDeleting, setModalDelete]);

  const handleValidateExtraForm = useCallback(
    (values: any) => {
      const { startDate, endDate, thumbnailSrc } = values;
      const result = {
        startDate: validateStartDate(startDate),
        endDate: validateEndDate(startDate, endDate),
        tags: validateTags(tags),
        thumbnailSrc: validateImage(thumbnailSrc),
      };

      if (Object.values(result).filter((entry) => entry).length === 0)
        return {};

      return result;
    },
    [tags]
  );

  const handleLeaveEdit = useCallback(() => {
    setMode("view");
  }, [setMode]);

  const renderCardActiveContentTab = useCallback(
    ({
      validateForm,
      setFieldValue,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
      setFieldValue?: (
        field: string,
        value: any,
        shouldValidate?: boolean | undefined
      ) => void;
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

  const renderCardContents = useCallback(
    ({
      submitForm,
      validateForm,
      setFieldValue,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
      setFieldValue?: (
        field: string,
        value: any,
        shouldValidate?: boolean | undefined
      ) => void;
    }) => {
      const activeTabContent = renderCardActiveContentTab({
        submitForm,
        validateForm,
        setFieldValue,
      });

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
          {activeTabContent}
          <PageViewEventFoot
            event={event}
            stateSubmitting={stateSubmitting}
            stateMode={stateMode}
            onLeaveEdit={handleLeaveEdit}
            submitForm={submitForm}
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
          validationSchema={SchemaEvent}
          onSubmit={handleSubmitForm}
          validateOnChange
        >
          {/** @todos Submit button seems to not work unless you do this. */}
          {({ submitForm, validateForm, setFieldValue }) => (
            <LayoutCard
              className={clsx(className, !focusThumbnail && "!h-full")}
              form
            >
              {renderCardContents({
                submitForm,
                validateForm,
                setFieldValue,
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
