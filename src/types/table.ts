import { ReactNode } from "react";
import type { SemanticWIDTHS, StrictTableCellProps } from "semantic-ui-react";
import { Either } from "./misc";

interface StickyHeaderTableColumnBaseProps<X> {
  headerName: string;
  cellWidth: SemanticWIDTHS;
  cellProps?: (data: X) => StrictTableCellProps;
  cellElement?: (data: X) => ReactNode;
  important?: boolean;
}

export type StickyHeaderTableColumnProps<X> =
  StickyHeaderTableColumnBaseProps<X> &
    Either<
      {
        key: keyof X;
      },
      {
        cellElement: (data: X) => ReactNode;
      }
    >;
