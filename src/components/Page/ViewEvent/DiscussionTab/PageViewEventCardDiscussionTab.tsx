/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import pushid from "pushid";
import { Button, Form, Icon, Loader, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import { LayoutNotice, ModalConfirmation, User } from "@/components";
import {
  RuleComment,
  createComment,
  deleteComment,
  getComments,
  getTimeDifference,
  sleep,
} from "@/utils";
import {
  CommentReportType,
  CommentType,
  DatabaseCommentType,
  EventType,
  IdentificationType,
  ReportBaseType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { useReport, useToast } from "@/hooks";
import { ASSET_NO_CONTENT } from "@/consts";

interface PageViewEventCardDiscussionTabProps {
  stateEvent: StateObject<EventType>;
  type: ScreenSizeCategoryType;
  identification: IdentificationType;
}

export function PageViewEventCardDiscussionTab({
  stateEvent,
  type,
  identification,
}: PageViewEventCardDiscussionTabProps) {
  const [event, setEvent] = stateEvent;
  const { commentCount, id } = event;
  const [comments, setComments] = useState<CommentType[]>([]);
  const auth = getAuth();
  const isLoggedIn = useMemo(() => auth.currentUser, [auth]);
  const [buttonIsLoading, setButtonIsLoading] = useState(false);
  const { addToastPreset } = useToast();
  const { showReportModal } = useReport();
  const { user, initialized } = identification;
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const pageIsEmpty = useMemo(() => comments.length <= 0, [comments.length]);

  const [deleting, setDeleting] = useState(false);

  const authorized = useMemo(() => {
    if (!initialized) return undefined;

    return Boolean(user && !user.ban);
  }, [initialized, user]);

  const handlePostComment = useCallback(
    async (values: any) => {
      const poster = auth.currentUser;
      const commentId = pushid();
      const newCommentObject = {} as DatabaseCommentType;
      const newComment = {
        commentId: commentId,
        authorId: poster?.uid as string,
        authorName: poster?.displayName as string,
        postDate: new Date().getTime(),
        text: values.comment,
      };
      newCommentObject[commentId] = newComment;

      setButtonIsLoading(true);
      createComment(id, newCommentObject)
        .then(() => {
          setComments((prev) => [newComment, ...prev]);
          setEvent((prev) => ({
            ...prev,
            commentCount: (prev.commentCount ?? 0) + 1,
          }));
        })
        .catch((e) => {
          addToastPreset("fail-post");
        })
        .finally(() => {
          sleep(100);
          setButtonIsLoading(false);
        });
    },
    [addToastPreset, auth.currentUser, id, setEvent]
  );

  useEffect(() => {
    if (commentCount && commentCount > 0)
      getComments(id)
        .then((comments) => {
          setComments(comments);
        })
        .catch((e) => {
          addToastPreset("fail-get");
        })
        .finally(() => {
          setPageIsLoading(false);
        });
    else setPageIsLoading(false);
  }, [addToastPreset, commentCount, id]);

  const renderDeleteButton = useCallback(
    (commentId: string) => {
      return (
        <ModalConfirmation
          trigger={
            <span className="cursor-pointer hover:text-slate-600">Delete</span>
          }
          onConfirm={() => {
            deleteComment(id, commentId)
              .then(() => {
                setComments((prev) =>
                  prev.filter((c) => c.commentId !== commentId)
                );
                setEvent((prev) => ({
                  ...prev,
                  commentCount: (prev.commentCount ?? 0) - 1,
                }));
              })
              .finally(() => {
                setDeleting(false);
              });
          }}
          loading={deleting}
          color="red"
          modalText="Are you sure you want to delete this event? This cannot be undone later."
          confirmText="Delete"
        />
      );
    },
    [deleting, id, setEvent]
  );

  const renderCommentCard = useCallback(
    (comment: CommentType, last?: boolean) => (
      <div className={COMMENT_WRAPPER_STYLE} key={comment.commentId}>
        <div
          className={clsx(COMMENT_ICON_STYLE, !last && COMMENT_SIDELINE_STYLE)}
        >
          <User id={comment.authorId} type="picture" />
        </div>
        <div className="flex gap-2.5 items-center h-8">
          <span className="font-semibold text-16px">
            <User id={comment.authorId} type="name" />
          </span>
          <span className="flex pt-1 text-slate-400 text-12px">
            {getTimeDifference(comment.postDate)}
          </span>
        </div>
        <div className="flex items-center">{comment.text}</div>
        <div className={COMMENT_REPORT_STYLE}>
          {user && comment.authorId !== user.id && (
            <span
              onClick={() =>
                showReportModal({
                  commentId: comment.commentId,
                  eventId: id,
                  authorId: comment.authorId,
                  contentType: "comment",
                  reportedBy: auth.currentUser
                    ? auth.currentUser.uid
                    : "invalid",
                } as ReportBaseType & CommentReportType)
              }
              className={"cursor-pointer hover:text-slate-600"}
            >
              Report
            </span>
          )}
          {user &&
            (user.role === "admin" || comment.authorId === user.id) &&
            renderDeleteButton(comment.commentId)}
        </div>
      </div>
    ),
    [auth.currentUser, id, renderDeleteButton, showReportModal, user]
  );

  const renderCommentInput = useMemo(
    () => (
      <Formik
        initialValues={{
          comment: "",
        }}
        onSubmit={(values, { resetForm }) => {
          handlePostComment(values);
          resetForm();
        }}
        validationSchema={Yup.object().shape({
          comment: RuleComment,
        })}
      >
        {({ submitForm, values, errors }) => (
          <Form className="form flex flex-col items-end gap-4">
            <Field name="comment">
              {({ field }: any) => (
                <TextArea
                  name="ui comment"
                  className={clsx(
                    "!text-16px !w-full",
                    !authorized && "cursor-not-allowed"
                  )}
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
                  disabled={!authorized}
                />
              )}
            </Field>
            <div className="flex justify-between w-full">
              <span className="ml-2 bg-white text-red-500 text-16px">
                {errors.comment !== "Required" ? errors.comment : ""}
              </span>
              <Button
                type="submit"
                onClick={submitForm}
                color="yellow"
                loading={buttonIsLoading}
                disabled={!authorized || values.comment === ""}
              >
                <Icon name="paper plane" className="pr-6" />
                Post
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [authorized, handlePostComment, buttonIsLoading]
  );

  const renderEventComments = useMemo(
    () =>
      pageIsLoading ? (
        <Loader active={pageIsLoading} inline="centered" />
      ) : (
        <div className="flex flex-col gap-8 w-full">
          {isLoggedIn && renderCommentInput}
          <div className="flex flex-col gap-4 w-full">
            {pageIsEmpty ? (
              <LayoutNotice
                illustration={ASSET_NO_CONTENT}
                title="No one was here"
                description="Be the first to post a comment"
              />
            ) : (
              comments &&
              comments.map((comment, id) =>
                renderCommentCard(comment, id === comments.length - 1)
              )
            )}
          </div>
        </div>
      ),
    [
      comments,
      isLoggedIn,
      pageIsEmpty,
      pageIsLoading,
      renderCommentCard,
      renderCommentInput,
    ]
  );

  return (
    <div
      className={clsx(
        EVENT_CARD_BODY_WRAPPER_STYLE,
        type === "mobile" && "!px-6"
      )}
    >
      {renderEventComments}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "!h-full px-12 pt-6 pb-6 overflow-y-auto";

const COMMENT_ICON_STYLE =
  "z-10 relative flex justify-center row-span-3 after:-z-2 text-white";

const COMMENT_SIDELINE_STYLE = [
  "after:content-[''] after:absolute after:top-0 after:right-1/2",
  "after:h-full-1rem after:w-px after:translate-x-1/2 after:bg-slate-400",
];

const COMMENT_WRAPPER_STYLE = "grid grid-cols-[1fr_15fr] grid-rows-3 gap-x-4";

const COMMENT_REPORT_STYLE = "flex items-center text-slate-400 text-16px gap-2";
