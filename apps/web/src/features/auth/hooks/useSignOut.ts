"use client";

import { useState } from "react";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase/client";

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);

  async function signOut() {
    setIsLoading(true);
    try {
      const auth = getAuth(firebaseApp);
      await firebaseSignOut(auth);
    } finally {
      setIsLoading(false);
    }
  }

  return { signOut, isLoading };
}
