/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";
import { createData } from "@/utils";
import { FIREBASE_COLLECTION_USERS } from "@/consts";

export function getErrorMessage(code: any) {
  switch (code) {
    case "auth/email-already-in-use":
      return { type: "email", message: "This email is already in use!" };
    case "auth/invalid-email":
      return { type: "email", message: "This email is invalid!" };
    case "auth/user-not-found":
      return { type: "email", message: "This account does not exist." };
    case "auth/wrong-password":
      return { type: "password", message: "Wrong password." };
    default:
      return {
        type: "generic",
        message: "Something went wrong. Please try again later.",
      };
  }
}

export interface loginParams {
  email: string;
  password: string;
  onSuccess?: (cred: UserCredential) => void;
  onFail?: (error: unknown) => void;
}

export interface registerParams {
  email: string;
  name: string;
  password: string;
  onSuccess?: (cred: UserCredential) => void;
  onFail?: (error: unknown) => void;
}

export async function login({
  email,
  password,
}: loginParams): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function register({
  email,
  name,
  password,
}: registerParams): Promise<void> {
  return createUserWithEmailAndPassword(auth, email, password).then(
    (userCredential) => {
      return createData(
        FIREBASE_COLLECTION_USERS,
        {
          name: name,
          email: email,
          joinDate: new Date().getTime(),
          notificationCount: 0,
          subscribedEvents: [],
          unseenEvents: [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        userCredential.user.uid
      );
    }
  );
}

export async function logout() {
  setTimeout(async () => {
    await signOut(auth);
  }, 300);
}
