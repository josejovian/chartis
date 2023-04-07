import { QueryConstraint, child, get, query, ref, set } from "firebase/database";
import { EventType } from "@/types";
import { db } from "../config";

export async function getEvents(path: string, constraints: QueryConstraint[] = []): Promise<EventType[]> {
  return await new Promise<EventType[]>(function (res, rej) {
    get(query(child(ref(db), path), ...constraints))
      .then((snapshot) => {
        let result = {};
        if (snapshot.exists()) {
          result = snapshot.val();
        }
        const eventsArray = [] as EventType[];

        for (const [, val] of Object.entries(result)) {
          eventsArray.push(val as EventType);
        }
        res(eventsArray);
      })
      .catch((error) => {
        rej(error);
      });
  });
}

export async function getDataFromPath(path: string, constraints = null) {
  return await new Promise(function (res, rej) {
    get(child(ref(db), path))
      .then((snapshot) => {
        let result = null;
        if (snapshot.exists()) {
          result = snapshot.val();
        }
        res(result);
      })
      .catch((error) => {
        rej(error);
      });
  });
}

export async function setDataToPath(path: string, data: object) {
  return await new Promise(function (res, rej) {
    set(ref(db, path), data)
      .then(() => res(null))
      .catch((error) => rej(error));
  });
}
