import { LayoutNoticePresetType } from "@/types";
import { Dimmer, Loader, Segment } from "semantic-ui-react";
import { LayoutNoticeProps } from "./LayoutNoticeProps";

export const LAYOUT_NOTICE_PRESET_LOADER: LayoutNoticeProps = {
  title: "Loading",
  illustrationElement: (
    <Segment className="Segment">
      <Dimmer active inverted>
        <Loader inverted />
      </Dimmer>
    </Segment>
  ),
  className: "mt-8",
};

export const LAYOUT_NOTICE_PRESETS: Record<
  LayoutNoticePresetType,
  LayoutNoticeProps
> = {
  loader: LAYOUT_NOTICE_PRESET_LOADER,
};
