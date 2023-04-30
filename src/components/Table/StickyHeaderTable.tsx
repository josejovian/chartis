import { ReactNode, useMemo } from "react";
import { Table } from "semantic-ui-react";
import clsx from "clsx";
import { ScreenSizeCategoryType, StickyHeaderTableColumnProps } from "@/types";

interface StickyHeaderTableProps<X> {
  name: string;
  emptyElement?: ReactNode;
  columns: StickyHeaderTableColumnProps<X>[];
  data: X[];
  type: ScreenSizeCategoryType;
}

export function StickyHeaderTable<X>({
  name,
  emptyElement,
  columns,
  data,
  type,
}: StickyHeaderTableProps<X>) {
  const visibleColumns = useMemo(
    () => columns.filter((column) => type !== "mobile" || column.important),
    [columns, type]
  );

  return (
    <div className="h-full overflow-hidden">
      <div className="ManageUserTableTop pr-2">
        <Table className="!h-fit !border-b-0 !m-0">
          <Table.Header className="text-12px">
            <Table.Row>
              {visibleColumns.map((column) => (
                <Table.HeaderCell
                  key={String(`Table_${name}_${column.headerName}`)}
                  width={column.cellWidth}
                >
                  {column.headerName}
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
        </Table>
      </div>
      <div
        className={clsx(
          "ManageUserTableBottom !border-l overflow-y-scroll",
          data.length === 0 && "!h-full flex items-center",
          type === "mobile" && "StickyHeaderTableMobile"
        )}
      >
        {data.length > 0 ? (
          <Table className=" !h-fit !border-b-0 !border-l-0">
            <Table.Body className="text-12px">
              {data.map((datum, y) => (
                <Table.Row key={String(`Table_${name}_Row${y}`)}>
                  {visibleColumns.map((column) => {
                    const { cellProps, cellElement, key } = column;
                    return (
                      <Table.Cell
                        key={String(
                          `Table_${name}_Row${y}_${column.headerName}`
                        )}
                        width={column.cellWidth}
                        {...(cellProps ? cellProps(datum) : {})}
                      >
                        {cellElement ? cellElement(datum) : <>{datum[key]}</>}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          emptyElement
        )}
      </div>
    </div>
  );
}
