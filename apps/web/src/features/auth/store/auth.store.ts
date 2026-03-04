import { create } from "zustand";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthStore {
  user: AuthUser | null;
  status: AuthStatus;
  // organizationId = uid until S-17 introduces real org management
  organizationId: string | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  status: "loading",
  organizationId: null,
  setUser: (user) => set({ user, status: "authenticated", organizationId: user.uid }),
  clearUser: () => set({ user: null, status: "unauthenticated", organizationId: null }),
}));
