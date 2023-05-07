import { TemplateSearchInput } from "@/components";
import { StateObject } from "@/types";

export interface SearchEventInputProps {
  stateQuery: StateObject<string>;
}

export function PageSearchEventInput({ stateQuery }: SearchEventInputProps) {
  return (
    <TemplateSearchInput
      placeholder="Search events..."
      stateQuery={stateQuery}
    />
  );
}
