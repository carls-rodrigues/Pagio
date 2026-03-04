import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { InvoiceUploadForm } from "../components/InvoiceUploadForm";

// --- mocks ---

const mockUpload = jest.fn();

jest.mock("../hooks/useInvoiceUpload", () => ({
  useInvoiceUpload: () => ({
    upload: mockUpload,
    loading: false,
    progress: 0,
    error: null,
  }),
}));

jest.mock("@/features/vendors/hooks/useVendors", () => ({
  useVendors: () => ({
    vendors: [
      {
        id: "v-1",
        name: "Acme Corp",
        email: "acme@example.com",
        taxId: "123",
        organizationId: "org-1",
      },
    ],
    loading: false,
  }),
}));

jest.mock("@/features/auth/store/auth.store", () => ({
  useAuthStore: (selector: (s: object) => unknown) =>
    selector({ user: { uid: "user-1" }, organizationId: "org-1", status: "authenticated" }),
}));

// --- helpers ---

function selectFile(input: HTMLElement, file: File): void {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

function makeFile(type: string, size = 1024): File {
  return new File([new Uint8Array(size)], "invoice.pdf", { type });
}

// --- tests ---

describe("InvoiceUploadForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpload.mockResolvedValue("invoice-id-1");
  });

  it("renders a vendor select, file input, and submit button", () => {
    render(<InvoiceUploadForm />);
    expect(screen.getByLabelText(/vendor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invoice file/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload invoice/i })).toBeInTheDocument();
  });

  it("lists available vendors in the select", () => {
    render(<InvoiceUploadForm />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows an error when submitted without a vendor", async () => {
    render(<InvoiceUploadForm />);
    fireEvent.submit(screen.getByRole("form", { name: /upload invoice/i }));
    expect(await screen.findByText(/please select a vendor/i)).toBeInTheDocument();
  });

  it("shows an error for an unsupported file type", async () => {
    render(<InvoiceUploadForm />);

    fireEvent.change(screen.getByLabelText(/vendor/i), { target: { value: "v-1" } });
    selectFile(screen.getByLabelText(/invoice file/i), makeFile("text/plain"));
    fireEvent.submit(screen.getByRole("form", { name: /upload invoice/i }));

    expect(await screen.findByText(/PDF, JPG, and PNG/i)).toBeInTheDocument();
  });

  it("shows an error when the file exceeds 10 MB", async () => {
    render(<InvoiceUploadForm />);

    fireEvent.change(screen.getByLabelText(/vendor/i), { target: { value: "v-1" } });
    selectFile(
      screen.getByLabelText(/invoice file/i),
      makeFile("application/pdf", 10 * 1024 * 1024 + 1)
    );
    fireEvent.submit(screen.getByRole("form", { name: /upload invoice/i }));

    expect(await screen.findByText(/10 MB/i)).toBeInTheDocument();
  });

  it("calls upload with the selected vendorId and file on valid submission", async () => {
    render(<InvoiceUploadForm />);

    const file = makeFile("application/pdf");
    fireEvent.change(screen.getByLabelText(/vendor/i), { target: { value: "v-1" } });
    selectFile(screen.getByLabelText(/invoice file/i), file);
    fireEvent.submit(screen.getByRole("form", { name: /upload invoice/i }));

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalledWith("v-1", file);
    });
  });

  it("calls onSuccess with the invoice ID after a successful upload", async () => {
    const onSuccess = jest.fn();
    render(<InvoiceUploadForm onSuccess={onSuccess} />);

    const file = makeFile("application/pdf");
    fireEvent.change(screen.getByLabelText(/vendor/i), { target: { value: "v-1" } });
    selectFile(screen.getByLabelText(/invoice file/i), file);
    fireEvent.submit(screen.getByRole("form", { name: /upload invoice/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith("invoice-id-1");
    });
  });
});
