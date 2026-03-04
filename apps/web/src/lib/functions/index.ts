import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "@/lib/firebase/client";

// Callable Cloud Functions client — expand as functions are implemented
export const functions = getFunctions(
  firebaseApp,
  process.env.NEXT_PUBLIC_USE_EMULATOR === "true" ? "localhost" : undefined
);

export function callFunction<TData, TResult>(name: string) {
  return httpsCallable<TData, TResult>(functions, name);
}
