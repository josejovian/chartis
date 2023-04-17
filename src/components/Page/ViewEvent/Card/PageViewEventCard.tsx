/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Formik } from "formik";
import pushid from "pushid";
import {
  LayoutCard,
  PageViewEventBody,
  PageViewEventFoot,
  PageViewEventHead,
} from "@/components";
import { useIdentification, useEvent, useToast } from "@/hooks";
import {
  SchemaEvent,
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
} from "@/types";
import { EVENT_EMPTY } from "@/consts";
import { createDataDirect } from "@/firebase";

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
  updateEvent: (id: string, newEvt: Partial<EventType>) => void;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  type,
  updateEvent,
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

  const handleSubmitForm = useCallback(
    async (values: unknown) => {
      if (!user) return;

      setSubmitting(true);

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

      await sleep(200);

      await createDataDirect("event", newEvent, newEvent.id)
        .then(async () => {
          await sleep(200);
          if (mode === "create") {
            addToast({
              title: "Event Created",
              description: "",
              variant: "success",
            });
            router.push(`/event/${eventId}`);
          } else {
            addToast({
              title: "Event Updated",
              description: "",
              variant: "success",
            });
            setMode("view");
            setEvent(newEvent);
          }
        })
        .catch((e) => {
          addToastPreset("post-fail");
          setSubmitting(false);
        });
    },
    [
      addToast,
      addToastPreset,
      event,
      mode,
      router,
      setEvent,
      setMode,
      setSubmitting,
      tags,
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

  const renderCardContent = useCallback(
    ({
      submitForm,
      validateForm,
    }: {
      submitForm?: () => void;
      validateForm?: () => void;
    }) => (
      <>
        <PageViewEventHead
          event={event}
          type={type}
          stateDeleting={stateDeleting}
          stateModalDelete={stateModalDelete}
          stateMode={stateMode}
          identification={identification}
          onDelete={handleDeleteEvent}
          updateEvent={updateEvent}
        />
        <PageViewEventBody
          event={event}
          type={type}
          mode={mode}
          stateTags={stateTags}
          validateForm={validateForm}
        />
        <PageViewEventFoot
          event={event}
          stateSubmitting={stateSubmitting}
          stateMode={stateMode}
          onLeaveEdit={handleLeaveEdit}
          submitForm={submitForm}
        />
      </>
    ),
    [
      event,
      type,
      stateDeleting,
      stateModalDelete,
      stateMode,
      identification,
      handleDeleteEvent,
      updateEvent,
      mode,
      stateTags,
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
    <LayoutCard className={className}>{renderCardContent({})}</LayoutCard>
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
          {renderCardContent({
            submitForm,
            validateForm,
          })}
        </LayoutCard>
      )}
    </Formik>
  );
}
