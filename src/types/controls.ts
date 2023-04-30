import { type SemanticCOLORS } from "semantic-ui-react";

export interface DropdownOptionType {
  name: string;
  color: SemanticCOLORS;
}

export interface DropdownSortOptionType<X> extends DropdownOptionType {
  id: string;
  key: keyof X;
  descending: boolean;
}
