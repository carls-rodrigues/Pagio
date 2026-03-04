import { renderHook, act } from "@testing-library/react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useInvoiceUpload } from "../hooks/useInvoiceUpload";

// --- mocks ---

jest.mock("firebase/storage", () => ({
  ref: jest.fn(),
  uploadBytesResumable: jest.fn(),
  getDownloadURL: jest.fn(),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(() => ({ id: "new-invoice-id" })),
  setDoc: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Timestamp: { now: jest.fn(() => ({ seconds: 1000, nanoseconds: 0 })) } as any,
}));

jest.mock("@/lib/firebase/storage", () => ({ storage: {} }));
jest.mock("@/lib/firebase/client", () => ({ firebaseApp: {} }));

// Typed references to the mocked functions
const mockRef = jest.mocked(ref);
const mockUploadBytesResumable = jest.mocked(uploadBytesResumable);
const mockGetDownloadURL = jest.mocked(getDownloadURL);
const mockDoc = jest.mocked(doc);
const mockSetDoc = jest.mocked(setDoc);

// --- helpers ---

function makeSuccessfulUploadTask() {
  return {
    on: jest.fn((_event: string, _onProgress: unknown, _onError: unknown, onComplete: () => void) =>
      onComplete()
    ),
    // Satisfy the UploadTask type minimally
  } as unknown as ReturnType<typeof uploadBytesResumable>;
}

function makeFailingUploadTask(error: Error) {
  return {
    on: jest.fn((_event: string, _onProgress: unknown, onError: (e: Error) => void) =>
      onError(error)
    ),
  } as unknown as ReturnType<typeof uploadBytesResumable>;
}

// --- tests ---

describe("useInvoiceUpload", () => {
  const options = { organizationId: "org-123", userId: "user-456" };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRef.mockReturnValue({} as ReturnType<typeof ref>);
    mockUploadBytesResumable.mockReturnValue(makeSuccessfulUploadTask());
    mockGetDownloadURL.mockResolvedValue("https://storage.example.com/invoice.pdf");
    mockSetDoc.mockResolvedValue(undefined);
    mockDoc.mockReturnValue({ id: "new-invoice-id" } as ReturnType<typeof doc>);
  });

  it("starts with loading false, no error, and zero progress", () => {
    const { result } = renderHook(() => useInvoiceUpload(options));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it("returns the new invoice ID after upload", async () => {
    const { result } = renderHook(() => useInvoiceUpload(options));
    const file = new File(["content"], "invoice.pdf", { type: "application/pdf" });

    let invoiceId: string | undefined;
    await act(async () => {
      invoiceId = await result.current.upload("vendor-123", file);
    });

    expect(invoiceId).toBe("new-invoice-id");
  });

  it("creates the invoice document in Firestore with status pending", async () => {
    const { result } = renderHook(() => useInvoiceUpload(options));
    const file = new File(["content"], "invoice.pdf", { type: "application/pdf" });

    await act(async () => {
      await result.current.upload("vendor-123", file);
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "pending",
        vendorId: "vendor-123",
        organizationId: "org-123",
        fileUrl: "https://storage.example.com/invoice.pdf",
        lineItems: [],
        aiRecommendation: null,
        isAnomalous: false,
        anomalyReason: null,
        rejectionReason: null,
        paidAt: null,
        approvedAt: null,
        approvedBy: null,
      })
    );
  });

  it("sets loading to false after upload completes", async () => {
    const { result } = renderHook(() => useInvoiceUpload(options));
    const file = new File(["content"], "invoice.pdf", { type: "application/pdf" });

    await act(async () => {
      await result.current.upload("vendor-123", file);
    });

    expect(result.current.loading).toBe(false);
  });

  it("sets error and clears loading on upload failure", async () => {
    mockUploadBytesResumable.mockReturnValue(makeFailingUploadTask(new Error("Storage error")));

    const { result } = renderHook(() => useInvoiceUpload(options));
    const file = new File(["content"], "invoice.pdf", { type: "application/pdf" });

    await act(async () => {
      try {
        await result.current.upload("vendor-123", file);
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe("Upload failed. Please try again.");
    expect(result.current.loading).toBe(false);
  });
});
