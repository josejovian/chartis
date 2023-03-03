import { Icon } from "semantic-ui-react";
import clsx from "clsx";
import { PageViewEventCardDetailEditor } from "@/components";
import { EventDetailType, EventDetailUnionType, EventModeType } from "@/types";

export interface PageViewEventCardDetailProps {
  details: EventDetailType[];
  mode: EventModeType;
}

export function PageViewEventCardDetail({
  details,
  mode,
}: PageViewEventCardDetailProps) {
  return (
    <table className="EventDetailsTable border-collapse mt-4">
      <tbody>
        {details.map((detail) => {
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
                      <PageViewEventCardDetailEditor
                        name={id}
                        defaultValue={rawValue}
                        placeholder={placeholder}
                        type={inputType}
                      />
                    )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const DETAIL_CELL_BASE_STYLE =
  "pl-3 pr-4 !h-10 text-14px border border-secondary-3";
