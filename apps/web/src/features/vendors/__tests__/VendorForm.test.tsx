import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { VendorForm } from "../components/VendorForm";

const mockCreateVendor = jest.fn();

jest.mock("../hooks/useCreateVendor", () => ({
  useCreateVendor: jest.fn(),
}));

import { useCreateVendor } from "../hooks/useCreateVendor";
const mockUseCreateVendor = useCreateVendor as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCreateVendor.mockReturnValue({
    createVendor: mockCreateVendor,
    loading: false,
    error: null,
  });
});

describe("VendorForm", () => {
  it("renders name, email, tax ID fields and submit button", () => {
    render(<VendorForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    render(<VendorForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "billing@acme.com" },
    });
    fireEvent.change(screen.getByLabelText(/tax id/i), { target: { value: "US123" } });
    fireEvent.click(screen.getByRole("button", { name: /add vendor/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when email is invalid", async () => {
    render(<VendorForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "not-an-email" } });
    fireEvent.change(screen.getByLabelText(/tax id/i), { target: { value: "US123" } });
    fireEvent.click(screen.getByRole("button", { name: /add vendor/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when tax ID is empty", async () => {
    render(<VendorForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "billing@acme.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add vendor/i }));
    await waitFor(() => {
      expect(screen.getByText(/tax id is required/i)).toBeInTheDocument();
    });
  });

  it("calls createVendor with correct args on valid submit", async () => {
    mockCreateVendor.mockResolvedValueOnce("vendor-id-123");
    render(<VendorForm />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "billing@acme.com" },
    });
    fireEvent.change(screen.getByLabelText(/tax id/i), {
      target: { value: "US123456789" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add vendor/i }));
    await waitFor(() => {
      expect(mockCreateVendor).toHaveBeenCalledWith({
        name: "Acme Corp",
        email: "billing@acme.com",
        taxId: "US123456789",
      });
    });
  });

  it("calls onSuccess after successful create", async () => {
    mockCreateVendor.mockResolvedValueOnce("vendor-id-123");
    const onSuccess = jest.fn();
    render(<VendorForm onSuccess={onSuccess} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Acme Corp" } });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "billing@acme.com" },
    });
    fireEvent.change(screen.getByLabelText(/tax id/i), {
      target: { value: "US123456789" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add vendor/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("displays server error from hook", () => {
    mockUseCreateVendor.mockReturnValue({
      createVendor: mockCreateVendor,
      loading: false,
      error: "A vendor with this Tax ID already exists.",
    });
    render(<VendorForm />);
    expect(screen.getByText(/a vendor with this tax id already exists/i)).toBeInTheDocument();
  });

  it("disables submit button while loading", () => {
    mockUseCreateVendor.mockReturnValue({
      createVendor: mockCreateVendor,
      loading: true,
      error: null,
    });
    render(<VendorForm />);
    expect(screen.getByRole("button", { name: /add vendor/i })).toBeDisabled();
  });
});
