import {
  CreateMapPathToParams,
  ReadMapPathToParams,
  UpdateMapPathToParams,
  DeleteMapPathToParams,
  ReadMapPathToReturn,
  ReadOneParams,
  ReadMultipleParams,
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

export async function readAllDataDirect<K = unknown>(
  group: string,
  constraints: QueryConstraint[] = []
) {
  const q = query(collection(fs, group), ...constraints);

  const querySnapshot = await getDocs(q);

  const data: unknown[] = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  return data as K;
}

export async function readDataDirect<K = unknown>(group: string, id: string) {
  const docRef = doc(fs, group, id);
  const docSnap = await getDoc(docRef);

  return docSnap.exists() ? (docSnap.data() as K) : undefined;
}

export async function createDataDirect(
  group: string,
  data: object,
  id?: string
) {
  const autoId = pushid();

  return setDoc(doc(fs, group, id ?? autoId), data);
}

export async function updateDataDirect(
  group: string,
  id: string,
  data: object
) {
  return updateDoc(doc(fs, group, id), data);
}

export async function deleteDataDirect(group: string, id: string) {
  return deleteDoc(doc(fs, group, id));
}

export async function createData<K extends CreatePathType>(
  path: K,
  params: CreateMapPathToParams[K]
) {
  const { collection } = CREATE_PATHS_PROPERTIES[path];

  return createDataDirect(collection, params.data);
}

export async function readData<K extends ReadPathType>(
  path: K,
  params: ReadMapPathToParams[K]
) {
  const { collection, multiple } = READ_PATHS_PROPERTIES[path];

  if (multiple) {
    const { constraints } = params as ReadMultipleParams;
    return readAllDataDirect<ReadMapPathToReturn[K]>(collection, constraints);
  }

  if (params) {
    const { id } = params as ReadOneParams;
    return readDataDirect<ReadMapPathToReturn[K]>(collection, id);
  }

  return null;
}

export async function updateData<K extends UpdatePathType>(
  path: K,
  params: UpdateMapPathToParams[K]
) {
  const { collection } = UPDATE_PATHS_PROPERTIES[path];

  return updateDataDirect(collection, params.id, params.data);
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

export type CreatePathType = "event" | "user";
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
  create: CreatePathType;
  read: ReadPathType;
  update: UpdatePathType;
  delete: DeletePathType;
}

export type OperationType = keyof CrudPathsType;

export const CREATE_PATHS_PROPERTIES: Record<
  CreatePathType,
  CreatePathPropertyType
> = {
  event: {
    collection: FIREBASE_COLLECTION_EVENTS,
  },
  user: {
    collection: FIREBASE_COLLECTION_USERS,
  },
};

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
