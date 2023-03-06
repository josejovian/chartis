import { child, get, ref, set } from "firebase/database";
import { db } from "../config";

export async function getDataFromPath(path: string) {
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
