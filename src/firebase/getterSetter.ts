import { UserType, EventType, DatabaseCommentType } from "@/types";
import pushid from "pushid";
import {
  type DocumentData,
  type QueryConstraint,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { fs } from "./config";

type FIREBASE_COLLECTION = {
  users: UserType;
  events: EventType;
  comments: DatabaseCommentType;
};

export async function createData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(
  group: COLLECTION_NAME,
  data: FIREBASE_COLLECTION[COLLECTION_NAME],
  id?: string,
  merge = false
): Promise<void> {
  const autoId = pushid();

  return setDoc(doc(fs, group, id ?? autoId), data, { merge: merge });
}

export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(
  group: COLLECTION_NAME,
  constraints: string
): Promise<FIREBASE_COLLECTION[COLLECTION_NAME] | undefined>;
export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(
  group: COLLECTION_NAME,
  constraints: QueryConstraint[]
): Promise<FIREBASE_COLLECTION[COLLECTION_NAME][] | []>;
export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(group: COLLECTION_NAME, constraints: string | QueryConstraint[]) {
  if (typeof constraints === "string") {
    const docRef = doc(fs, group, constraints);
    const docSnap = await getDoc(docRef);

    return docSnap.exists() ? docSnap.data() : undefined;
  } else {
    const q = query(collection(fs, group), ...constraints);

    const querySnapshot = await getDocs(q);

    const data: unknown[] = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });

    return data as FIREBASE_COLLECTION[COLLECTION_NAME][];
  }
}

export async function updateData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(
  group: COLLECTION_NAME,
  id: string,
  data: Partial<FIREBASE_COLLECTION[COLLECTION_NAME]>
): Promise<void> {
  return updateDoc(doc(fs, group, id), data as DocumentData);
}

export async function deleteData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTION
>(group: COLLECTION_NAME, id: string): Promise<void> {
  return deleteDoc(doc(fs, group, id));
}
