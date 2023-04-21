export interface CommentType {
  commentId: string;
  authorId: string;
  text: string;
  postDate: number;
  authorName: string;
}

export interface DatabaseCommentType {
  [commentId: string]: CommentType;
}
