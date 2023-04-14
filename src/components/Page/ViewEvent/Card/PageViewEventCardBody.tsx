/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useMemo } from "react";
import { Field, Formik } from "formik";
import {
  Button,
  Dropdown,
  Form,
  Icon,
  Input,
  TextArea,
} from "semantic-ui-react";
import clsx from "clsx";
import {
  EventTags,
  FormErrorMessage,
  PageViewEventCardDetail,
  UserPicture,
} from "@/components";
import { getTimeDifference, strDateTime } from "@/utils";
import { EVENT_TAGS } from "@/consts";
import {
  EventDetailType,
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { useIdentification } from "@/hooks";
import * as Yup from "yup";
import { auth, setDataToPath } from "@/firebase";
import pushid from "pushid";

export interface PageViewEventBodyProps {
  stateActiveTab: StateObject<number>;
  event: EventType;
  mode: EventModeType;
  stateTags: StateObject<number[]>;
  type: ScreenSizeCategoryType;
  validateForm?: () => void;
}

export function PageViewEventBody({
  stateActiveTab,
  event,
  mode,
  stateTags,
  validateForm,
}: PageViewEventBodyProps) {
  const { users } = useIdentification()[0];
  const {
    id,
    location,
    authorId,
    organizer,
    startDate,
    endDate,
    description,
    postDate,
  } = event;
  const [tags, setTags] = stateTags;
  const activeTab = stateActiveTab[0];

  const renderEventTags = useMemo(
    () => (
      <div className="flex gap-2">
        <EventTags
          id={event.id}
          tags={event.tags}
          type="EventCardDetail"
          size="tiny"
        />
      </div>
    ),
    [event.id, event.tags]
  );

  const handleUpdateTagJSON = useCallback(
    (values: string[]) => {
      setTags(values ? values.map((value) => Number(value)) : []);
      setTimeout(() => {
        validateForm && validateForm();
      }, 100);
    },
    [setTags, validateForm]
  );

  const renderEditEventTags = useMemo(
    () => (
      <>
        <Dropdown
          placeholder="Enter event tags"
          className="!border-0 !min-h-0 !py-0"
          fluid
          search
          selection
          multiple
          transparent
          defaultValue={tags}
          onChange={(_, { value }) => handleUpdateTagJSON(value as string[])}
          onMouseDown={() => validateForm && validateForm()}
          onBlur={() => validateForm && validateForm()}
          options={EVENT_TAGS.map(({ name }, idx) => ({
            key: `SelectTag_${name}`,
            text: name,
            value: idx,
          }))}
        />
        <Field name="tags">
          {({ field, meta }: any) => (
            <div className="">
              <Input
                className="EventInput !hidden"
                size="big"
                transparent
                {...field}
              />
              <FormErrorMessage meta={meta} className="!z-10" overlap />
            </div>
          )}
        </Field>
      </>
    ),
    [handleUpdateTagJSON, tags, validateForm]
  );

  const details = useMemo<EventDetailType[]>(
    () => [
      {
        icon: "tags",
        id: "tags",
        name: "TAGS",
        viewElement: renderEventTags,
        editElement: renderEditEventTags,
      },
      {
        icon: "group",
        id: "organizer",
        name: "ORGANIZER",
        rawValue: organizer,
        inputType: "text",
        placeholder: "Enter event organizer",
      },
      {
        icon: "location arrow",
        id: "location",
        name: "LOCATION",
        rawValue: location,
        inputType: "text",
        placeholder: "Enter event location",
      },
      {
        icon: "calendar",
        id: "startDate",
        name: "START",
        rawValue: startDate,
        moddedValue: startDate && strDateTime(new Date(startDate)),
        inputType: "datetime-local",
      },
      {
        icon: "calendar",
        id: "endDate",
        name: "END",
        rawValue: endDate,
        moddedValue: endDate && strDateTime(new Date(endDate)),
        inputType: "datetime-local",
      },
    ],
    [
      endDate,
      location,
      organizer,
      renderEditEventTags,
      renderEventTags,
      startDate,
    ]
  );

  const renderEventCreators = useMemo(
    /** @todo Replace authorId with real username. */
    () =>
      mode === "view" && (
        <span className="text-14px text-secondary-4">
          Posted by <b>{users[authorId] ? users[authorId].name : authorId}</b>{" "}
          {getTimeDifference(postDate)}
        </span>
      ),
    [authorId, mode, postDate, users]
  );

  const renderEventName = useMemo(
    () =>
      mode === "view" ? (
        <h2 className="h2 text-secondary-7">{event.name}</h2>
      ) : (
        <Field name="name">
          {({ field, meta }: any) => (
            <div className="mt-5">
              <Input
                className="EventInput w-full font-bold !text-red-100 !font-bold !h-8 !border-0"
                style={{ fontSize: "1.5rem" }}
                size="big"
                placeholder="Enter event name"
                transparent
                {...field}
              />
              <FormErrorMessage meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [event.name, mode]
  );

  const renderEventDetails = useMemo(
    () => <PageViewEventCardDetail details={details} mode={mode} />,
    [details, mode]
  );

  const renderEventDescription = useMemo(
    () =>
      mode === "view" ? (
        <pre className="mt-8">{description}</pre>
      ) : (
        <Field name="description">
          {({ field, meta }: any) => (
            <div className="mt-8">
              <TextArea
                className="EventInput !p-0 !b-0 !text-14px"
                transparent
                style={{
                  resize: "none",
                  lineHeight: "1.25rem",
                  minHeight: "4rem",
                  border: "0!important",
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = "0";
                  e.currentTarget.style.height =
                    e.currentTarget.scrollHeight + "px";
                }}
                placeholder="Enter event description (8 - 256 characters long)."
                {...field}
              />
              <FormErrorMessage meta={meta} className="mt-2" />
            </div>
          )}
        </Field>
      ),
    [description, mode]
  );

  const handlePostComment = useCallback(
    async (values: any) => {
      const poster = auth.currentUser;
      const commentId = pushid();
      const newComment = {
        postDate: new Date().getTime(),
        comment: values.comment,
        username: poster?.displayName,
        authorId: poster?.uid,
      };

      await setDataToPath(`/comments/${id}/${commentId}`, newComment);
    },
    [id]
  );

  const renderEventCardContent = useMemo(() => {
    if (activeTab === 1)
      return (
        <div className="flex flex-col gap-12">
          <Formik
            initialValues={{
              comment: "",
            }}
            onSubmit={handlePostComment}
            validationSchema={Yup.object().shape({
              comment: Yup.string()
                .min(2, "Too Short!")
                .max(50, "Too Long!")
                .required("Required"),
            })}
          >
            {({ isSubmitting, submitForm, isValid, dirty, errors, values }) => (
              <Form className="flex flex-col items-end gap-2">
                <Field name="comment">
                  {({ form: { touched, errors }, field, meta }: any) => (
                    <TextArea
                      name="comment"
                      className="!text-14px"
                      style={{
                        resize: "none",
                        lineHeight: "1.25rem",
                        height: "5.9rem",
                        border: "0!important",
                      }}
                      onInput={(e) => {
                        e.currentTarget.style.height = "6rem";
                        e.currentTarget.style.height =
                          e.currentTarget.scrollHeight + "px";
                      }}
                      placeholder="Discuss about the event here"
                      {...field}
                    />
                  )}
                </Field>
                <div className="flex justify-between w-full">
                  <span className="-mt-5 ml-2 bg-white font-semibold text-red-500 text-12px">
                    {errors.comment !== "Required" ? errors.comment : ""}
                  </span>
                  <Button
                    className="ml-auto"
                    icon
                    type="submit"
                    onClick={submitForm}
                    color="yellow"
                  >
                    <Icon name="paper plane" className="pr-6" />
                    Post
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[1fr_15fr] grid-rows-3 gap-x-4">
              <div className="flex justify-center row-span-3 relative z-10 after:-z-2 after:absolute after:right-1/2 after:translate-x-1/2 after:content-[''] text-white after:bg-slate-400 after:h-full after:w-px after:top-0">
                <UserPicture fullName={"?"} />
              </div>
              <div className="flex gap-2.5 items-center h-8">
                <div className="font-semibold">USERNAME</div>
                <div className="text-slate-400 text-sm flex self-end pb-[0.3rem]">
                  Yesterday
                </div>
              </div>
              <div className="flex items-center">
                Will they also teach me how to install the IDE?
              </div>
              <div className="flex items-center text-slate-400 text-sm">
                Report
              </div>
            </div>
          </div>
        </div>
      );
    return (
      <>
        {renderEventCreators}
        {renderEventName}
        {renderEventDetails}
        {renderEventDescription}
      </>
    );
  }, [
    activeTab,
    handlePostComment,
    renderEventCreators,
    renderEventDescription,
    renderEventDetails,
    renderEventName,
  ]);

  return (
    <div
      className={clsx(
        EVENT_CARD_BODY_WRAPPER_STYLE,
        mode !== "view" && "ui form div !h-full"
      )}
    >
      {renderEventCardContent}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-4 pb-6 overflow-y-auto";
