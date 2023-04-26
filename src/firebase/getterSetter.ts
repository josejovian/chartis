import {
  UserType,
  EventType,
  EventUpdateArrayType,
  DatabaseCommentType,
} from "@/types";
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
  writeBatch,
} from "firebase/firestore";
import { fs } from "./config";
import {
  FIREBASE_COLLECTION_COMMENTS,
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_UPDATES,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";

type FIREBASE_COLLECTION = {
  [FIREBASE_COLLECTION_USERS]: UserType;
  [FIREBASE_COLLECTION_EVENTS]: EventType;
  [FIREBASE_COLLECTION_UPDATES]: EventUpdateArrayType;
  [FIREBASE_COLLECTION_COMMENTS]: DatabaseCommentType;
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

type OPERATION_TYPE = {
  create: FIREBASE_COLLECTION;
  update: Partial<FIREBASE_COLLECTION>;
  delete: object;
};

export type BatchOperationType = {
  collectionName: keyof FIREBASE_COLLECTION;
  documentId: string;
  operationType: keyof OPERATION_TYPE;
  value: OPERATION_TYPE[keyof OPERATION_TYPE];
};

export async function writeDataBatch(
  batchOperations: BatchOperationType[]
): Promise<void> {
  const batch = writeBatch(fs);

  for (const operation of batchOperations) {
    const operationTarget = doc(
      fs,
      operation.collectionName,
      operation.documentId
    );
    switch (operation.operationType) {
      case "create":
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        batch.set(operationTarget, operation.value);
        break;
      case "update":
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        batch.update(operationTarget, operation.value);
        break;
      case "delete":
        batch.delete(operationTarget);
        break;
    }
  }

  return batch.commit();
}
