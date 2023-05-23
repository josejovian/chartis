import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { PageViewEventCardDetailTabDetailEditor } from "@/components";
import {
  EventDetailType,
  EventDetailUnionType,
  EventModeType,
  ScreenSizeCategoryType,
} from "@/types";

export interface PageViewEventCardDetailTabDetailProps {
  details: EventDetailType[];
  mode: EventModeType;
  type: ScreenSizeCategoryType;
  className?: string;
}

export function PageViewEventCardDetailTabDetail({
  details,
  mode,
  type,
  className,
}: PageViewEventCardDetailTabDetailProps) {
  const renderDesktopEntries = useMemo(
    () =>
      details.map((detail) => {
        const {
          name,
          shortName,
          icon,
          required,
          editElement,
          id,
          inputType,
          rawValue,
          viewElement,
          moddedValue,
          placeholder,
        } = detail as EventDetailUnionType;

        return (
          <tr key={`ModalViewEventBody_Detail-${name}`}>
            <th
              className={clsx(
                DETAIL_CELL_BASE_STYLE,
                "w-fit",
                type === "mobile" && DETAIL_CELL_MOBILE_STYLE
              )}
            >
              <div className={clsx("!w-fit flex gap-1 text-slate-500")}>
                <Icon name={icon} />
                <span className={clsx(type === "mobile" && "!text-12px")}>
                  {type !== "mobile" ? name : shortName ?? name}
                </span>
                {mode !== "view" && required && (
                  <span className="font-black text-red-500">*</span>
                )}
              </div>
            </th>
            <td
              className={clsx(
                DETAIL_CELL_BASE_STYLE,
                "relative w-full break-word",
                mode !== "view" && "!p-0 !pr-0",
                type === "mobile" && DETAIL_CELL_MOBILE_STYLE
              )}
            >
              {mode === "view"
                ? viewElement || moddedValue || rawValue || "-"
                : editElement ?? (
                    <PageViewEventCardDetailTabDetailEditor
                      name={id}
                      placeholder={placeholder}
                      defaultValue={rawValue}
                      type={inputType}
                    />
                  )}
            </td>
          </tr>
        );
      }),
    [details, mode, type]
  );

  return (
    <table
      className={clsx(
        "EventDetailsTable border-collapse mt-4",
        type === "mobile" ? "EventDetailsTableMobile" : "EventDetailsTable",
        className
      )}
    >
      <tbody>{renderDesktopEntries}</tbody>
    </table>
  );
}

const DETAIL_CELL_BASE_STYLE =
  "pl-3 pr-4 !h-10 text-14px border border-secondary-3";

const DETAIL_CELL_MOBILE_STYLE = "!h-10 text-14px";
