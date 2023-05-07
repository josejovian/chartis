/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { increment } from "firebase/firestore";
import { createData, readData, updateData } from "@/firebase";
import { Field, Formik } from "formik";
import * as Yup from "yup";
import pushid from "pushid";
import { Button, Form, Icon, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import { UserPicture } from "@/components";
import { getTimeDifference, sleep } from "@/utils";
import {
  CommentReportType,
  CommentType,
  DatabaseCommentType,
  EventType,
  ReportBaseType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";
import { useReport, useToast } from "@/hooks";

interface PageViewEventCardDiscussionTabProps {
  stateEvent: StateObject<EventType>;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCardDiscussionTab({
  stateEvent,
  type,
}: PageViewEventCardDiscussionTabProps) {
  const [event, setEvent] = stateEvent;
  const { commentCount, id } = event;
  const [comments, setComments] = useState<CommentType[]>([]);
  const auth = getAuth();
  const isLoggedIn = useMemo(() => auth.currentUser, [auth]);
  const [loading, setLoading] = useState(false);
  const { addToastPreset } = useToast();
  const { showReportModal } = useReport();

  const handleGetEventUpdates = useCallback(async () => {
    if (commentCount === 0) return;

    const rawData = await readData("comments", id);
    const data = Object.entries(rawData ?? {})
      .reduce((arr: CommentType[], [k, v]: any) => {
        arr.push({ commentId: k, ...v });
        return arr;
      }, [])
      .sort((a, b) => b.postDate - a.postDate) as CommentType[];

    setComments(data);
  }, [commentCount, id]);

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
      setLoading(true);
      await sleep(200);

      createData(`comments`, newCommentObject, id, true)
        .then(async () => {
          await updateData("events", id, { commentCount: increment(1) as any });
          setComments((prev) => [newComment, ...prev]);
          setEvent((prev) => ({
            ...prev,
            commentCount: (prev.commentCount ?? 0) + 1,
          }));

          await sleep(100);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          addToastPreset("post-fail");
        });
    },
    [addToastPreset, auth.currentUser, id, setEvent]
  );

  useEffect(() => {
    handleGetEventUpdates();
  }, [handleGetEventUpdates]);

  const renderCommentCard = useCallback(
    (comment: CommentType, last?: boolean) => (
      <div className={COMMENT_WRAPPER_STYLE} key={comment.commentId}>
        <div
          className={clsx(COMMENT_ICON_STYLE, !last && COMMENT_SIDELINE_STYLE)}
        >
          <UserPicture fullName={comment.authorName} />
        </div>
        <div className="flex gap-2.5 items-center h-8">
          <span className="font-semibold text-16px">{comment.authorName}</span>
          <span className="flex pt-1 text-slate-400 text-12px">
            {getTimeDifference(comment.postDate)}
          </span>
        </div>
        <div className="flex items-center">{comment.text}</div>
        <div
          onClick={() =>
            showReportModal({
              commentId: comment.commentId,
              eventId: id,
              authorId: comment.authorId,
              contentType: "comment",
              reportedBy: auth.currentUser ? auth.currentUser.uid : "invalid",
            } as ReportBaseType & CommentReportType)
          }
          className={COMMENT_REPORT_STYLE}
        >
          Report
        </div>
      </div>
    ),
    [auth.currentUser, id, showReportModal]
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
          comment: Yup.string()
            .max(500, "Your comment is too Long!")
            .required("Required"),
        })}
      >
        {({ submitForm, values, errors }) => (
          <Form className="form flex flex-col items-end gap-4">
            <Field name="comment">
              {({ field }: any) => (
                <TextArea
                  name="ui comment"
                  className="!text-16px !w-full"
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
              <span className="ml-2 bg-white text-red-500 text-16px">
                {errors.comment !== "Required" ? errors.comment : ""}
              </span>
              <Button
                className="ml-auto"
                icon
                type="submit"
                onClick={submitForm}
                color="yellow"
                loading={loading}
                disabled={values.comment === ""}
              >
                <Icon name="paper plane" className="pr-6" />
                Post
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [handlePostComment, loading]
  );

  const renderEventComments = useMemo(
    () => (
      <div className="flex flex-col gap-8 pt-6 w-full">
        {isLoggedIn && renderCommentInput}
        <div className="flex flex-col gap-4 w-full">
          {comments &&
            comments.map((comment, id) =>
              renderCommentCard(comment, id === comments.length - 1)
            )}
        </div>
      </div>
    ),
    [comments, isLoggedIn, renderCommentCard, renderCommentInput]
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

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-6 pb-6 overflow-y-auto";

const COMMENT_ICON_STYLE =
  "z-10 relative flex justify-center row-span-3 after:-z-2 text-white";

const COMMENT_SIDELINE_STYLE = [
  "after:content-[''] after:absolute after:top-0 after:right-1/2",
  "after:h-full-1rem after:w-px after:translate-x-1/2 after:bg-slate-400",
];

const COMMENT_WRAPPER_STYLE = "grid grid-cols-[1fr_15fr] grid-rows-3 gap-x-4";

const COMMENT_REPORT_STYLE =
  "flex items-center text-slate-400 hover:text-slate-600 text-16px cursor-pointer";
