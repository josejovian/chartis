/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Formik } from "formik";
import {
  LayoutCard,
  PageViewEventBody,
  PageViewEventFoot,
  PageViewEventHead,
} from "@/components";
import { useUser } from "@/hooks";
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
import { setDataToPath } from "@/firebase";
import pushid from "pushid";
import { useRouter } from "next/router";
import { EVENT_EMPTY } from "@/consts";

export interface ModalViewEventProps {
  className?: string;
  stateEvent: StateObject<EventType>;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCard({
  className,
  stateEvent,
  stateMode,
  type,
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

  const identification = useUser();
  const { user } = identification;

  const handleSubmitForm = useCallback(
    async (values: unknown) => {
      if (!user) return;

      setSubmitting(true);

      const { startDate, endDate } = values as EventType;
      const eventId = mode === "create" ? pushid() : event.id;
      const postEditDates = {
        postDate: new Date().getTime(),
        editDate: new Date().getTime(),
      };

      const newEvent: EventType = {
        ...postEditDates,
        ...(event ?? postEditDates),
        ...(values as EventType),
        id: eventId,
        authorId: user.uid,
        tags,
      };

      newEvent.startDate = new Date(startDate).getTime();

      if (endDate) newEvent.endDate = new Date(endDate).getTime();
      else delete newEvent.endDate;

      if (!newEvent.postDate) newEvent.postDate = postEditDates.postDate;

      await sleep(200);

      setSubmitting(false);

      await setDataToPath(`/events/${eventId}/`, newEvent)
        .then(async () => {
          await sleep(200);
          if (mode === "create") {
            router.push(`/event/${eventId}`);
          } else {
            setMode("view");
            setEvent(newEvent);
          }
        })
        .catch((e) => {
          setSubmitting(false);
        });
    },
    [event, mode, router, setEvent, setMode, setSubmitting, tags, user]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!event.id) return;

    setDeleting(true);

    await sleep(200);

    await setDataToPath(`/events/${event.id}/`, {})
      .then(async () => {
        await sleep(200);
        router.push(`/`);
      })
      .catch((e) => {
        setDeleting(false);
      });
  }, [event, router, setDeleting]);

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
          stateMode={stateMode}
          identification={identification}
          onDelete={handleDeleteEvent}
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
      stateMode,
      identification,
      handleDeleteEvent,
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
