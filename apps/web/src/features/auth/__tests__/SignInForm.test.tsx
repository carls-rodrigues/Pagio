import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SignInForm } from "../components/SignInForm";

// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn().mockReturnValue({}),
  signInWithEmailAndPassword: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock firebase client
jest.mock("@/lib/firebase/client", () => ({
  firebaseApp: {},
}));

import { signInWithEmailAndPassword } from "firebase/auth";
const mockSignIn = signInWithEmailAndPassword as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignInForm", () => {
  it("renders email and password fields and a submit button", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("calls signInWithEmailAndPassword with correct args on valid submit", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: "123" } });
    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(expect.anything(), "user@example.com", "password123");
    });
  });

  it("redirects to dashboard after successful sign-in", async () => {
    mockSignIn.mockResolvedValueOnce({ user: { uid: "123" } });
    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error message when credentials are invalid", async () => {
    mockSignIn.mockRejectedValueOnce({ code: "auth/invalid-credential" });
    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
