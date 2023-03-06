import { ReactNode } from "react";
import { Either, LayoutNoticePresetType } from "@/types";

export interface LayoutNoticeBaseProps {
  title: string;
}

export interface LayoutPresetProps {
  preset: LayoutNoticePresetType;
}

export interface LayoutNoticeDesc {
  description?: string;
}

export interface LayoutNoticeDescElm {
  descriptionElement?: ReactNode;
}

export interface LayoutNoticeIllust {
  illustration?: string;
}

export interface LayoutNoticeIllustElm {
  illustrationElement?: ReactNode;
}

export type LayoutNoticeWithoutPresetProps = LayoutNoticeBaseProps &
  Either<LayoutNoticeDesc, LayoutNoticeDescElm> &
  Either<LayoutNoticeIllust, LayoutNoticeIllustElm>;

export type LayoutNoticeWithoutPresetUnionProps = LayoutNoticeBaseProps &
  (LayoutNoticeDesc & LayoutNoticeDescElm) &
  (LayoutNoticeIllust & LayoutNoticeIllustElm);

export type LayoutNoticeProps = Either<
  LayoutNoticeWithoutPresetProps,
  LayoutPresetProps
>;

export type LayoutNoticeUnionProps = LayoutNoticeWithoutPresetUnionProps &
  LayoutPresetProps;
