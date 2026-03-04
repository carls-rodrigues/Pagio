import { create } from "zustand";
import type { User } from "@pagio/shared";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

// Initialized with 'loading' to prevent flash of unauthenticated UI
// onAuthStateChanged fires once and sets the real status
export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  setUser: (user) => set({ status: "authenticated", user }),
  clearUser: () => set({ status: "unauthenticated", user: null }),
}));
