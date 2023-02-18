import { ScreenSizeType } from "@/types";
import { createContext } from "react";

export const SCREEN_CONTEXT_DEFAULT: ScreenSizeType = {
  width: 0,
  type: "mobile",
};

export const ScreenContext = createContext(SCREEN_CONTEXT_DEFAULT);
