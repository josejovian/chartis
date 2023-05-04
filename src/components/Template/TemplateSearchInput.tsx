import { useCallback, useEffect, useRef } from "react";
import { Input } from "semantic-ui-react";
import { validateEventQuery } from "@/utils";
import { StateObject } from "@/types";

export interface SearchInputProps {
  placeholder: string;
  stateQuery: StateObject<string>;
}

export function TemplateSearchInput({
  placeholder,
  stateQuery,
}: SearchInputProps) {
  const [query, setQuery] = stateQuery;

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleUpdateQuery = useCallback(
    (newQuery: string) => {
      const valid = validateEventQuery(newQuery);

      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (!valid) {
          setQuery("");
          return;
        }

        setQuery(newQuery);
      }, 300);
    },
    [setQuery]
  );

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Input
      className="grow"
      placeholder={placeholder}
      defaultValue={query}
      onChange={(e) => handleUpdateQuery(e.target.value)}
    />
  );
}
