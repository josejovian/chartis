/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

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
  onSuccess,
  onFail,
}: loginParams) {
  return await new Promise((res, rej) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        onSuccess && onSuccess(cred);
        res(null);
      })
      .catch((error) => {
        onFail && onFail(error);
        rej(error);
      });
  });
}

export async function register({
  email,
  name,
  password,
  onSuccess,
  onFail,
}: registerParams) {
  return await new Promise((res, rej) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        onSuccess && onSuccess(cred);
        res(null);
      })
      .catch((error) => {
        onFail && onFail(error);
        rej(error.code);
      });
  });
}

export async function logout() {
  setTimeout(async () => {
    await signOut(auth);
  }, 300);
}
