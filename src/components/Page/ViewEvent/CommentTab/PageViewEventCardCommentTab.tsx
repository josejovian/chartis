/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { increment } from "firebase/firestore";
import { createData, readData, updateData } from "@/firebase";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import pushid from "pushid";
import { Button, Icon, TextArea } from "semantic-ui-react";
import clsx from "clsx";
import { UserPicture } from "@/components";
import { getTimeDifference } from "@/utils";
import { CommentType, DatabaseCommentType, EventType } from "@/types";

interface PageViewEventCardDiscussionTabProps {
  event: EventType;
}

export function PageViewEventCardDiscussionTab({
  event,
}: PageViewEventCardDiscussionTabProps) {
  const { commentCount, id } = event;
  const [comments, setComments] = useState<CommentType[]>();
  const auth = getAuth();
  const isLoggedIn = useMemo(() => auth.currentUser, [auth]);

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
      const newComment = {} as DatabaseCommentType;
      newComment[commentId] = {
        commentId: commentId,
        authorId: poster?.uid as string,
        authorName: poster?.displayName as string,
        postDate: new Date().getTime(),
        text: values.comment,
      };

      createData(`comments`, newComment, id, true).then(() => {
        updateData("events", id, { commentCount: increment(1) as any });
      });
    },
    [auth.currentUser, id]
  );

  useEffect(() => {
    handleGetEventUpdates();
  }, [handleGetEventUpdates]);

  const renderCommentCard = useCallback(
    (comment: CommentType) => (
      <div
        className="grid grid-cols-[1fr_15fr] grid-rows-3 gap-x-4"
        key={comment.commentId}
      >
        <div
          className={clsx(
            "z-10 relative flex justify-center row-span-3 after:-z-2 text-white",
            "after:content-[''] after:absolute after:top-0 after:right-1/2",
            "after:h-full after:w-px after:translate-x-1/2 after:bg-slate-400"
          )}
        >
          <UserPicture fullName={comment.authorName} />
        </div>
        <div className="flex gap-2.5 items-center h-8">
          <div className="font-semibold text-xl">{comment.authorName}</div>
          <div className="text-slate-400 text-[0.7rem] flex self-end pb-[0.15rem]">
            {getTimeDifference(comment.postDate)}
          </div>
        </div>
        <div className="flex items-center">{comment.text}</div>
        <div className="flex items-center text-slate-400 text-sm">Report</div>
      </div>
    ),
    []
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
                loading={isSubmitting}
              >
                <Icon name="paper plane" className="pr-6" />
                Post
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    ),
    [handlePostComment]
  );

  const renderEventComments = useMemo(
    () => (
      <div className="flex flex-col gap-8 pt-6">
        {isLoggedIn && renderCommentInput}
        <div className="flex flex-col gap-4">
          {comments && comments.map(renderCommentCard)}
        </div>
      </div>
    ),
    [comments, isLoggedIn, renderCommentCard, renderCommentInput]
  );

  // return <div className="pt-8 px-16 overflow-y">{renderEventComments}</div>;

  return (
    <div className={clsx(EVENT_CARD_BODY_WRAPPER_STYLE)}>
      {renderEventComments}
    </div>
  );
}

const EVENT_CARD_BODY_WRAPPER_STYLE = "px-12 pt-6 pb-6 overflow-y-auto";
