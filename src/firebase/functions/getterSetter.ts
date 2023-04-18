import {
  UpdateMapPathToParams,
  DeleteMapPathToParams,
  UserType,
  EventType,
} from "@/types";
import { fs } from "../config";
import {
  FIREBASE_COLLECTION_EVENTS,
  FIREBASE_COLLECTION_USERS,
} from "@/consts";
import {
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
  collection: COLLECTION_NAME,
  data: FIREBASE_COLLECTIONS[COLLECTION_NAME],
  id?: string
) {
  const autoId = pushid();

  return setDoc(doc(fs, collection, id ?? autoId), data);
}

export async function readData<K extends keyof FIREBASE_COLLECTIONS>(
  group: K,
  constraints: string
): Promise<FIREBASE_COLLECTIONS[K] | undefined>;
export async function readData<K extends keyof FIREBASE_COLLECTIONS>(
  group: K,
  constraints: QueryConstraint[]
): Promise<FIREBASE_COLLECTIONS[K][] | []>;
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

export async function updateDataDirect(
  group: string,
  id: string,
  data: object
) {
  return updateDoc(doc(fs, group, id), data);
}

export async function updateData<K extends UpdatePathType>(
  path: K,
  params: UpdateMapPathToParams[K]
) {
  const { collection } = UPDATE_PATHS_PROPERTIES[path];

  return updateDataDirect(collection, params.id, params.data);
}

export async function deleteDataDirect(group: string, id: string) {
  return deleteDoc(doc(fs, group, id));
}

export async function deleteData<K extends DeletePathType>(
  path: K,
  params: DeleteMapPathToParams[K]
) {
  const { collection } = DELETE_PATHS_PROPERTIES[path];

  return deleteDataDirect(collection, params.id);
}

export interface CrudPathPropertyType {
  type: OperationType;
  collection: string;
  subcollection?: string;
  group?: boolean;
}

export type ReadPathType = "event" | "events" | "user";
export type UpdatePathType = "event" | "user";
export type DeletePathType = "event";

export interface CreatePathPropertyType {
  collection: string;
}

export interface ReadPathPropertyType {
  collection: string;
  multiple?: boolean;
}

export interface UpdatePathPropertyType {
  collection: string;
}

export interface DeletePathPropertyType {
  collection: string;
}

export interface CrudPathsType {
  read: ReadPathType;
  update: UpdatePathType;
  delete: DeletePathType;
}

export type OperationType = keyof CrudPathsType;

export const READ_PATHS_PROPERTIES: Record<ReadPathType, ReadPathPropertyType> =
  {
    event: {
      collection: FIREBASE_COLLECTION_EVENTS,
    },
    events: {
      collection: FIREBASE_COLLECTION_EVENTS,
      multiple: true,
    },
    user: {
      collection: FIREBASE_COLLECTION_USERS,
    },
  };

export const UPDATE_PATHS_PROPERTIES: Record<
  UpdatePathType,
  UpdatePathPropertyType
> = {
  event: {
    collection: FIREBASE_COLLECTION_EVENTS,
  },
  user: {
    collection: FIREBASE_COLLECTION_USERS,
  },
};

export const DELETE_PATHS_PROPERTIES: Record<
  DeletePathType,
  DeletePathPropertyType
> = {
  event: {
    collection: FIREBASE_COLLECTION_EVENTS,
  },
};
