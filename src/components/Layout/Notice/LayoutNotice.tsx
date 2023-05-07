import { useMemo } from "react";
import Image from "next/image";
import {
  LayoutNoticeProps,
  LayoutNoticeUnionProps,
  LAYOUT_NOTICE_PRESETS,
} from "@/components";
import { ASSET_CALENDAR } from "@/consts";

export function LayoutNotice(rawProps: LayoutNoticeProps) {
  const {
    title,
    description,
    descriptionElement,
    illustration = ASSET_CALENDAR,
    illustrationElement,
  } = useMemo(
    () =>
      (rawProps.preset
        ? LAYOUT_NOTICE_PRESETS[rawProps.preset]
        : rawProps) as unknown as LayoutNoticeUnionProps,
    [rawProps]
  );

  const renderIllustration = useMemo(() => {
    return illustrationElement ? (
      illustrationElement
    ) : (
      <Image src={illustration} width="290" height="180" alt="Calendar Image" />
    );
  }, [illustration, illustrationElement]);

  const renderDescription = useMemo(
    () =>
      descriptionElement ? (
        <div className="mt-4">{descriptionElement}</div>
      ) : (
        <span className="mt-1 text-16px text-center text-slate-500">
          {description}
        </span>
      ),
    [description, descriptionElement]
  );

  return (
    <div
      style={{ width: "75%" }}
      className="flex flex-col items-center justify-center mx-auto"
    >
      {renderIllustration}
      <span className="text-20px font-bold text-slate-500">{title}</span>
      {renderDescription}
    </div>
  );
}
