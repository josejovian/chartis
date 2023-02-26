import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../config";

export interface loginParams {
  email: string;
  password: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

export interface registerParams {
  email: string;
  name: string;
  password: string;
  onSuccess?: () => void;
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
      .then(() => {
        onSuccess && onSuccess();
        res(null);
      })
      .catch((error) => {
        onFail && onFail();
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
      .then(() => {
        onSuccess && onSuccess();
        res(null);
      })
      .catch((error) => {
        onFail && onFail();
        rej(error);
      });
  });
}

export async function logout() {
  return await signOut(auth);
}
