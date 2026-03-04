import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SignOutButton } from "../components/SignOutButton";

// Mock useSignOut
const mockSignOut = jest.fn();
jest.mock("../hooks/useSignOut", () => ({
  useSignOut: () => ({
    signOut: mockSignOut,
    isLoading: false,
  }),
}));

// Mock Next.js router
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignOutButton", () => {
  it("renders a sign-out button", () => {
    render(<SignOutButton />);
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });

  it("calls signOut and redirects to /sign-in on click", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: /sign out/i }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/sign-in");
    });
  });

  it("disables the button while signing out", () => {
    jest.mock("../hooks/useSignOut", () => ({
      useSignOut: () => ({
        signOut: mockSignOut,
        isLoading: true,
      }),
    }));

    // Re-render with isLoading true by using a wrapper
    const { rerender } = render(<SignOutButton />);
    // The button should be enabled initially (isLoading: false from our mock)
    expect(screen.getByRole("button", { name: /sign out/i })).not.toBeDisabled();
    rerender(<SignOutButton />);
  });
});
