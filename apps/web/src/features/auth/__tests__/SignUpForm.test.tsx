import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SignUpForm } from "../components/SignUpForm";

// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn().mockReturnValue({}),
  createUserWithEmailAndPassword: jest.fn(),
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

import { createUserWithEmailAndPassword } from "firebase/auth";
const mockCreateUser = createUserWithEmailAndPassword as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("SignUpForm", () => {
  it("renders email and password fields and a submit button", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows a validation error when email is invalid", async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "bad-email" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows a validation error when password is shorter than 8 characters", async () => {
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("calls createUserWithEmailAndPassword with correct args on valid submit", async () => {
    mockCreateUser.mockResolvedValueOnce({ user: { uid: "123" } });
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.anything(),
        "user@example.com",
        "password123"
      );
    });
  });

  it("redirects to dashboard after successful sign-up", async () => {
    mockCreateUser.mockResolvedValueOnce({ user: { uid: "123" } });
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error message when email is already in use", async () => {
    mockCreateUser.mockRejectedValueOnce({ code: "auth/email-already-in-use" });
    render(<SignUpForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is already in use/i)).toBeInTheDocument();
    });
  });
});
