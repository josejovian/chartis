import { createData } from "./getterSetter";
import { populateEvents } from "@/utils";

export async function populateDatabaseWithEvents() {
  const events = populateEvents(30, "auto-generated");

  for (const event of events) {
    await createData("events", event, event.id);
  }

  return;
}
