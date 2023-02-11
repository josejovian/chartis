import { Dispatch, SetStateAction } from "react";

export type StateObject<T> = [T, Dispatch<SetStateAction<T>>];
