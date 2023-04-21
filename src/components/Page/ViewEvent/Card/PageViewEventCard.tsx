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
import { LayoutCard, PageViewEventFoot, PageViewEventHead } from "@/components";
import { useIdentification, useEvent, useToast } from "@/hooks";
import {
  SchemaEvent,
  compareEventValues,
  sleep,
  validateEndDate,
  validateStartDate,
  validateTags,
} from "@/utils";
import {
  EventType,
  EventModeType,
  ScreenSizeCategoryType,
  StateObject,
  EventCardTabNameType,
  EventUpdateBatchType,
} from "@/types";
import {
  EVENT_EMPTY,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
} from "@/consts";
import { createData, fs } from "@/firebase";
import { PageViewEventCardDetailTab } from "../DetailTab";
import { PageViewEventCardUpdatesTab } from "../UpdatesTab";
import { doc, writeBatch } from "firebase/firestore";
import { increment } from "firebase/database";

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvt: Partial<EventType>) => void;
  eventPreviousValues?: MutableRefObject<EventType>;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  type,
  updateEvent,
  eventPreviousValues,
}: ModalViewEventProps) {
  const [event, setEvent] = stateEvent;
  const router = useRouter();
  const [mode, setMode] = stateMode;
  const stateTags = useState((event && event.tags) ?? []);
  const [tags, setTags] = stateTags;
  const stateSubmitting = useState(false);
  const setSubmitting = stateSubmitting[1];
  const stateDeleting = useState(false);
  const setDeleting = stateDeleting[1];
  const stateActiveTab = useState<EventCardTabNameType>("detail");
  const activeTab = stateActiveTab[0];
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
      object.startDate = new Date(object.startDate).toISOString().slice(0, 16);

    if (object.endDate)
      object.endDate = new Date(object.endDate).toISOString().slice(0, 16);

    return object;
  }, [event, mode]);
  const { addToast, addToastPreset } = useToast();
  const { stateModalDelete, deleteEvent } = useEvent({});

  const stateIdentification = useIdentification();
  const identification = stateIdentification[0];
  const { user } = identification;

  const handleConstructEventValues = useCallback(
    (values: unknown) => {
      if (!user) return null;

      const { startDate, endDate } = values as EventType;
      const eventId = mode === "create" ? pushid() : event.id;
      const defaultValues = {
        postDate: new Date().getTime(),
        editDate: new Date().getTime(),
        subscriberCount: 0,
        guestSubscriberCount: 0,
        subscriberIds: [],
      };

      const newEvent: EventType = {
        ...defaultValues,
        ...(event ?? defaultValues),
        ...(values as EventType),
        id: eventId,
        authorId: user.uid,
        authorName: user.displayName as string,
        tags,
      };

      newEvent.startDate = new Date(startDate).getTime();

      if (endDate) newEvent.endDate = new Date(endDate).getTime();
      else delete newEvent.endDate;

      if (!newEvent.postDate) newEvent.postDate = defaultValues.postDate;

      return {
        newEvent,
        eventId,
      };
    },
    [event, mode, tags, user]
  );

  const handleSubmitForm = useCallback(
    async (values: unknown) => {
      const data = handleConstructEventValues(values);

      if (!user || !data) return;

      setSubmitting(true);

      const { newEvent, eventId } = data;

      await sleep(200);

      if (mode === "create") {
        await createData("events", newEvent, newEvent.id).catch(() => {
          addToastPreset("post-fail");
          setSubmitting(false);
        });

        await sleep(200);
        addToast({
          title: "Event Created",
          description: "",
          variant: "success",
        });
        router.push(`/event/${eventId}`);
      } else if (eventPreviousValues && eventPreviousValues.current) {
        const changes = compareEventValues(
          eventPreviousValues.current,
          newEvent
        );

        try {
          const batch = writeBatch(fs);

          const eventRef = doc(fs, FIREBASE_COLLECTION_EVENTS, eventId);
          batch.update(eventRef, {
            ...(newEvent as Partial<EventType>),
            version: increment(Object.values(changes).length),
          });

          const eventBatchUpdateId = pushid();
          const updatesRef = doc(
            fs,
            FIREBASE_COLLECTION_UPDATES,
            eventBatchUpdateId
          );
          batch.set(updatesRef, {
            id: eventBatchUpdateId,
            eventId: event.id,
            authorId: user.uid,
            date: new Date().getTime(),
            updates: Object.values(changes),
          } as EventUpdateBatchType);

          await batch.commit();

          await sleep(200);
          addToast({
            title: "Event Updated",
            description: "",
            variant: "success",
          });
          setMode("view");
          setEvent(newEvent);
          setSubmitting(false);
          if (eventPreviousValues && eventPreviousValues.current)
            eventPreviousValues.current = newEvent;
        } catch (e) {
          addToastPreset("post-fail");
          setSubmitting(false);
        }
      }
    },
    [
      addToast,
      addToastPreset,
      event,
      eventPreviousValues,
      handleConstructEventValues,
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

    await deleteEvent({
      eventId: event.id,
      onFail: () => {
        setDeleting(false);
      },
    });
  }, [deleteEvent, event.id, setDeleting]);

  const handleValidateExtraForm = useCallback(
    (values: any) => {
      const { startDate, endDate } = values;
      const result = {
        startDate: validateStartDate(startDate),
        endDate: validateEndDate(startDate, endDate),
        tags: validateTags(tags),
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
      submitForm,
      validateForm,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
    }) => {
      switch (activeTab) {
        case "detail":
          return (
            <PageViewEventCardDetailTab
              event={event}
              type={type}
              mode={mode}
              stateActiveTab={stateActiveTab}
              stateTags={stateTags}
              validateForm={validateForm}
            />
          );
        case "updates":
          return <PageViewEventCardUpdatesTab event={event} />;
      }
    },
    [activeTab, event, mode, stateActiveTab, stateTags, type]
  );

  const renderCardContents = useCallback(
    ({
      submitForm,
      validateForm,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
    }) => {
      const activeTabContent = renderCardActiveContentTab({
        submitForm,
        validateForm,
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
            updateEvent={updateEvent}
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
      updateEvent,
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

  return mode === "view" ? (
    <LayoutCard className={className}>{renderCardContents({})}</LayoutCard>
  ) : (
    <Formik
      initialValues={initialEventData}
      validate={handleValidateExtraForm}
      validationSchema={SchemaEvent}
      onSubmit={handleSubmitForm}
      validateOnChange
    >
      {/** @todos Submit button seems to not work unless you do this. */}
      {({ submitForm, validateForm }) => (
        <LayoutCard className={className} form>
          {renderCardContents({
            submitForm,
            validateForm,
          })}
        </LayoutCard>
      )}
    </Formik>
  );
}
