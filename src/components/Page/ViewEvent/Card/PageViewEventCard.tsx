/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fs } from "@/firebase";
import { doc, increment, runTransaction, writeBatch } from "firebase/firestore";
import { useRouter } from "next/router";
import { Formik } from "formik";
import pushid from "pushid";
import {
  LayoutCard,
  PageViewEventFoot,
  PageViewEventHead,
  PageViewEventCardDetailTab,
  PageViewEventCardUpdatesTab,
  PageViewEventCardDiscussionTab,
} from "@/components";
import { useIdentification, useEvent, useToast } from "@/hooks";
import {
  SchemaEvent,
  compareEventValues,
  getLocalTimeInISO,
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
  EventUpdateArrayType,
  EventUpdateBatchDatabaseType,
} from "@/types";
import {
  EVENT_EMPTY,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvt: Partial<EventType>) => void;
  updateUserSubscribedEventClientSide: (
    userId: string,
    eventId: string,
    version?: number
  ) => void;
  eventPreviousValues?: MutableRefObject<EventType>;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  type,
  updateEvent,
  updateUserSubscribedEventClientSide,
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
      object.startDate = getLocalTimeInISO(object.startDate);

    if (object.endDate) object.endDate = getLocalTimeInISO(object.endDate);

    return object;
  }, [event, mode]);
  const { addToastPreset } = useToast();
  const { stateModalDelete, deleteEvent } = useEvent({});

  const { stateIdentification } = useIdentification();
  const identification = stateIdentification[0];
  const { user } = identification;

  const handleConstructEventValues = useCallback(
    (values: unknown) => {
      if (!user) return null;

      const { startDate, endDate } = values as EventType;
      const eventId = mode === "create" ? pushid() : event.id;
      const defaultValues = {
        postDate: new Date().getTime(),
        subscriberCount: 0,
        guestSubscriberCount: 0,
        subscriberIds: [],
      };

      const newEvent: EventType = {
        ...defaultValues,
        ...(event ?? defaultValues),
        ...(values as EventType),
        id: eventId,
        authorId: user.id,
        authorName: user.name,
        version: (event.version ?? 0) + (mode === "edit" ? 1 : 0),
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

  const handleFailedSubmit = useCallback(() => {
    if (!user) return;

    if (user.ban) {
      addToastPreset("fail-post-banned-user");
    } else {
      addToastPreset("fail-post");
    }
    setSubmitting(false);
  }, [addToastPreset, setSubmitting, user]);

  const handleSubmitForm = useCallback(
    async (values: unknown) => {
      const data = handleConstructEventValues(values);

      if (!user || !data) return;

      setSubmitting(true);

      const { newEvent, eventId } = data;
      const eventRef = doc(fs, FIREBASE_COLLECTION_EVENTS, eventId);
      const updatesRef = doc(fs, FIREBASE_COLLECTION_UPDATES, eventId);

      await sleep(200);

      if (mode === "create") {
        const batch = writeBatch(fs);
        batch.set(eventRef, newEvent);
        batch.set(updatesRef, {
          updates: [],
        });
        await batch
          .commit()
          .then(async () => {
            await sleep(200);
            addToastPreset("feat-event-create");
            router.push(`/event/${eventId}`);
          })
          .catch(() => {
            handleFailedSubmit();
          });
      } else if (eventPreviousValues && eventPreviousValues.current) {
        const changes = compareEventValues(
          eventPreviousValues.current,
          newEvent
        );

        try {
          const eventBatchUpdateId = pushid();

          await runTransaction(fs, async (transaction) => {
            const evtDoc = await transaction.get(eventRef);
            const updatesDoc = await transaction.get(updatesRef);
            const evt = evtDoc.exists() ? (evtDoc.data() as EventType) : event;
            let updates: EventUpdateBatchDatabaseType[] = updatesDoc.exists()
              ? (updatesDoc.data() as EventUpdateArrayType).updates
              : [];

            if (evt.subscriberIds)
              evt.subscriberIds.forEach((userId) => {
                const userRef = doc(fs, FIREBASE_COLLECTION_USERS, userId);

                transaction.update(userRef, {
                  [`unseenEvents.${evt.id}`]: true,
                  notificationCount: increment(1),
                });
              });

            transaction.update(eventRef, {
              ...(newEvent as Partial<EventType>),
              version: increment(1),
            });

            updates = [
              ...updates,
              {
                id: eventBatchUpdateId,
                authorId: user.id,
                date: new Date().getTime(),
                updates: changes,
              },
            ];

            transaction.update(updatesRef, {
              updates,
            });
          }).then(async () => {
            await sleep(200);
            router.replace(`/event/${event.id}/`);
            addToastPreset("feat-event-update");
            await sleep(200);
            setMode("view");
            setEvent((prev) => ({
              ...newEvent,
              version: (prev.version ?? 0) + 1,
            }));
            updateEvent(event.id, newEvent);
            setSubmitting(false);
            if (eventPreviousValues && eventPreviousValues.current)
              eventPreviousValues.current = newEvent;
          });
        } catch (e) {
          handleFailedSubmit();
        }
      }
    },
    [
      addToastPreset,
      event,
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
            />
          );
      }
    },
    [activeTab, event, mode, stateEvent, stateTags, type]
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
            updateEvent={updateEvent}
            updateUserSubscribedEventClientSide={
              updateUserSubscribedEventClientSide
            }
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
      updateUserSubscribedEventClientSide,
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
      {({ submitForm, validateForm, setFieldValue }) => (
        <LayoutCard className={className} form>
          {renderCardContents({
            submitForm,
            validateForm,
            setFieldValue,
          })}
        </LayoutCard>
      )}
    </Formik>
  );
}
