import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import { auth } from "./config";
//import { FieldConfirmPass, FieldPassword } from "@/utils";

export interface loginParams {
  email: string;
  password: string;
  onSuccess?: (cred: UserCredential) => void;
  onFail?: () => void;
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
    createUserWithEmailAndPassword(auth, email, password).then((cred) => {
      onSuccess && onSuccess(cred);
      res(null)
    }).catch((error) => {
      onFail && onFail();
      rej(error);
    });
    // if(FieldPassword === FieldConfirmPass){
    //   createUserWithEmailAndPassword(auth, email, password)
    //   .then((cred) => {
    //     onSuccess && onSuccess(cred);
    //     res(null);
    //   })
    //   .catch((error) => {
    //     onFail && onFail();
    //     rej(error);
    //   });
    // }
    // else{
    //   throw Error("Password doesn't macth. Try Again!")
    // }
  });
}

export async function logout() {
  setTimeout(async () => {
    await signOut(auth);
  }, 300);
}
