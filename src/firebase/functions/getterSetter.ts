import { UserType, EventType } from "@/types";
import { fs } from "../config";

import {
  // eslint-disable-next-line import/named
  DocumentData,
  QueryConstraint,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import pushid from "pushid";

type CommentType = [];

type FIREBASE_COLLECTIONS = {
  users: UserType;
  events: EventType;
  comment: CommentType;
};

export async function createData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
>(
  group: COLLECTION_NAME,
  data: FIREBASE_COLLECTIONS[COLLECTION_NAME],
  id?: string
): Promise<void> {
  const autoId = pushid();

  return setDoc(doc(fs, group, id ?? autoId), data);
}

export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
>(
  group: COLLECTION_NAME,
  constraints: string
): Promise<FIREBASE_COLLECTIONS[COLLECTION_NAME] | undefined>;
export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
>(
  group: COLLECTION_NAME,
  constraints: QueryConstraint[]
): Promise<FIREBASE_COLLECTIONS[COLLECTION_NAME][] | []>;
export async function readData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
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

    return data as FIREBASE_COLLECTIONS[COLLECTION_NAME][];
  }
}

export async function updateData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
>(
  group: COLLECTION_NAME,
  id: string,
  data: Partial<FIREBASE_COLLECTIONS[COLLECTION_NAME]>
): Promise<void> {
  return updateDoc(doc(fs, group, id), data as DocumentData);
}

export async function deleteData<
  COLLECTION_NAME extends keyof FIREBASE_COLLECTIONS
>(group: COLLECTION_NAME, id: string): Promise<void> {
  return deleteDoc(doc(fs, group, id));
}
