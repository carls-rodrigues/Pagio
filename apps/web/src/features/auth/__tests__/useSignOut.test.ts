import { renderHook, act } from "@testing-library/react";

// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn().mockReturnValue({}),
  signOut: jest.fn(),
}));

// Mock firebase client
jest.mock("@/lib/firebase/client", () => ({
  firebaseApp: {},
}));

import { signOut } from "firebase/auth";
const mockSignOut = signOut as jest.Mock;

import { useSignOut } from "../hooks/useSignOut";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useSignOut", () => {
  it("calls Firebase signOut when signOut is invoked", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useSignOut());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("returns isLoading false initially", () => {
    const { result } = renderHook(() => useSignOut());
    expect(result.current.isLoading).toBe(false);
  });

  it("sets isLoading to true while signing out", async () => {
    let resolveSignOut!: () => void;
    mockSignOut.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSignOut = resolve;
      })
    );

    const { result } = renderHook(() => useSignOut());

    act(() => {
      result.current.signOut();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveSignOut();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
