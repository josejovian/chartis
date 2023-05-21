import { StateObject } from "@/types";

interface DateTimePickProps {
  stateDateTime: StateObject<number>;
  type: "date" | "time";
}

export function DateTimePick({ stateDateTime, type }: DateTimePickProps) {
  return <div>Test</div>;
}
