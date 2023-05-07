import { CSSProperties } from "react";
import { type SemanticICONS } from "semantic-ui-react";

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

export interface LayoutHeadButtonType {
  icon: SemanticICONS;
  onClick: () => void;
}

export type LayoutNoticePresetType = "loader";
