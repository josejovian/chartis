import { CSSProperties } from "react";

export interface ScreenSizeType {
  width: number;
  type: ScreenSizeCategoryType;
}

export type ScreenSizeCategoryType = "mobile" | "desktop_sm" | "desktop_lg";

export type ResponsiveStyleType = Record<ScreenSizeCategoryType, string>;
export type ResponsiveInlineStyleType = Record<
  ScreenSizeCategoryType,
  Partial<CSSProperties> | undefined
>;
