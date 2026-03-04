"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from "@/lib/firebase/client";
import { useAuthStore } from "../store/auth.store";

// Call exactly once — in the root layout or auth provider.
// All components read from useAuthStore, never from Firebase directly.
export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        clearUser();
      }
    });
    return unsubscribe;
  }, [setUser, clearUser]);

  return useAuthStore((s) => ({ user: s.user, status: s.status }));
}
