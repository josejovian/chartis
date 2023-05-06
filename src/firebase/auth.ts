import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";

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
  onFail?: () => void;
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
        rej(error.code);
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
        onFail && onFail();
        rej(error);
      });
  });
}

export async function logout() {
  setTimeout(async () => {
    await signOut(auth);
  }, 300);
}
