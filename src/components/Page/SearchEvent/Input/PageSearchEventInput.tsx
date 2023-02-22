import { createRef, useCallback, useEffect, useRef } from "react";
import { Input } from "semantic-ui-react";
import { validateEventQuery } from "@/utils";
import { StateObject } from "@/types";

export interface SearchEventInputProps {
  stateQuery: StateObject<string>;
}

export function PageSearchEventInput({ stateQuery }: SearchEventInputProps) {
  const setQuery = stateQuery[1];

  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = createRef<Input>();

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

  const handleFocusUponLoad = useCallback(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [inputRef]);

  useEffect(() => {
    handleFocusUponLoad();
  }, [handleFocusUponLoad]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Input
      ref={inputRef}
      className="grow"
      placeholder="Search events..."
      onChange={(e) => handleUpdateQuery(e.target.value)}
    />
  );
}
