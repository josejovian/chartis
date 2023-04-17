import { createDataDirect } from "./getterSetter";
import { populateEvents } from "@/utils";

export async function populateDatabaseWithEvents() {
  const events = populateEvents(30, "auto-generated");

  for (const event of events) {
    await createDataDirect("events", event, event.id);
  }

  return;
}
