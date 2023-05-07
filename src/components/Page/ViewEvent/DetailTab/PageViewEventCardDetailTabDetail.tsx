import { useMemo } from "react";
import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { PageViewEventCardDetailTabDetailEditor } from "@/components";
import { EventDetailType, EventDetailUnionType, EventModeType } from "@/types";

export interface PageViewEventCardDetailTabDetailProps {
  details: EventDetailType[];
  mode: EventModeType;
}

export function PageViewEventCardDetailTabDetail({
  details,
  mode,
}: PageViewEventCardDetailTabDetailProps) {
  const renderEntries = useMemo(
    () =>
      details.map((detail) => {
        const {
          id,
          name,
          icon,
          editElement,
          viewElement,
          rawValue,
          moddedValue,
          placeholder,
          inputType,
        } = detail as EventDetailUnionType;

        return (
          <tr key={`ModalViewEventBody_Detail-${name}`}>
            <th className={clsx(DETAIL_CELL_BASE_STYLE, "w-fit")}>
              <div className="!w-fit flex gap-1 text-slate-500">
                <Icon name={icon} />
                <span>{name}</span>
              </div>
            </th>
            <td
              className={clsx(
                DETAIL_CELL_BASE_STYLE,
                "relative w-full",
                mode !== "view" && "!p-0"
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
    [details, mode]
  );

  return (
    <table className="EventDetailsTable border-collapse mt-4">
      <tbody>{renderEntries}</tbody>
    </table>
  );
}

const DETAIL_CELL_BASE_STYLE =
  "pl-3 pr-4 !h-10 text-14px border border-secondary-3";
