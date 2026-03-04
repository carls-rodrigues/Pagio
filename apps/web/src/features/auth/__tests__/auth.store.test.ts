import { act } from "@testing-library/react";
import { useAuthStore } from "../store/auth.store";

// Reset store state between tests
beforeEach(() => {
  act(() => {
    useAuthStore.getState().clearUser();
  });
});

describe("useAuthStore", () => {
  it("initializes with status loading and no user", () => {
    // Reset to initial state
    act(() => {
      useAuthStore.setState({ user: null, status: "loading" });
    });
    const { user, status } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(status).toBe("loading");
  });

  it("setUser updates user and sets status to authenticated", () => {
    const mockUser = { uid: "123", email: "user@example.com", displayName: "Test User" };
    act(() => {
      useAuthStore.getState().setUser(mockUser);
    });
    const { user, status } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
    expect(status).toBe("authenticated");
  });

  it("clearUser resets user to null and sets status to unauthenticated", () => {
    const mockUser = { uid: "123", email: "user@example.com", displayName: "Test User" };
    act(() => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().clearUser();
    });
    const { user, status } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(status).toBe("unauthenticated");
  });
});
