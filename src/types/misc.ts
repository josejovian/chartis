import { Dispatch, SetStateAction } from "react";

export type StateObject<T> = [T, Dispatch<SetStateAction<T>>];

// https://stackoverflow.com/a/66605669
export type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

export type Either<T, U> = Only<T, U> | Only<U, T>;
