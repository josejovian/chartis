import { useCallback } from "react";
import { Formik } from "formik";
import {
  LayoutCard,
  PageViewEventBody,
  PageViewEventFoot,
  PageViewEventHead,
} from "@/components";
import {
  EventModeType,
  EventType,
  ScreenSizeCategoryType,
  StateObject,
} from "@/types";

export interface ModalViewEventProps {
  className?: string;
  event: EventType;
  stateMode: StateObject<EventModeType>;
  type: ScreenSizeCategoryType;
}

export function PageViewEventCard({
  className,
  event,
  stateMode,
  type,
}: ModalViewEventProps) {
  const mode = stateMode[0];

  const renderCardContent = useCallback(
    ({ onSubmit }: { onSubmit?: () => void }) => (
      <>
        <PageViewEventHead event={event} type={type} stateMode={stateMode} />
        <PageViewEventBody event={event} type={type} mode={mode} />
        <PageViewEventFoot
          event={event}
          stateMode={stateMode}
          onSubmit={onSubmit}
        />
      </>
    ),
    [event, mode, stateMode, type]
  );

  return mode === "view" ? (
    <LayoutCard className={className}>{renderCardContent({})}</LayoutCard>
  ) : (
    <Formik
      initialValues={{ name: "Test", description: "Test" }}
      onSubmit={(val) => {
        console.log(val);
      }}
    >
      {({ submitForm }) => (
        <LayoutCard className={className} form>
          {renderCardContent({
            onSubmit: submitForm,
          })}
        </LayoutCard>
      )}
    </Formik>
  );
}
