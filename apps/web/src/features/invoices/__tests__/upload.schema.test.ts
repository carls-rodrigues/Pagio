import { uploadSchema } from "../schemas/upload.schema";

function makeFile(type: string, size: number): File {
  return new File([new Uint8Array(size)], "invoice.pdf", { type });
}

describe("uploadSchema", () => {
  const validVendorId = "vendor-123";
  const validFile = makeFile("application/pdf", 1024);

  it("accepts a valid PDF file with a vendor selected", () => {
    expect(uploadSchema.safeParse({ vendorId: validVendorId, file: validFile }).success).toBe(true);
  });

  it("accepts a JPEG file", () => {
    const file = makeFile("image/jpeg", 1024);
    expect(uploadSchema.safeParse({ vendorId: validVendorId, file }).success).toBe(true);
  });

  it("accepts a PNG file", () => {
    const file = makeFile("image/png", 1024);
    expect(uploadSchema.safeParse({ vendorId: validVendorId, file }).success).toBe(true);
  });

  it("rejects an unsupported file type", () => {
    const file = makeFile("text/plain", 1024);
    const result = uploadSchema.safeParse({ vendorId: validVendorId, file });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/PDF|JPG|PNG/i);
  });

  it("rejects a file over 10 MB", () => {
    const file = makeFile("application/pdf", 10 * 1024 * 1024 + 1);
    const result = uploadSchema.safeParse({ vendorId: validVendorId, file });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/10 MB/);
  });

  it("rejects an empty vendorId", () => {
    const result = uploadSchema.safeParse({ vendorId: "", file: validFile });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/vendor/i);
  });

  it("rejects a missing file", () => {
    const result = uploadSchema.safeParse({ vendorId: validVendorId, file: null });
    expect(result.success).toBe(false);
  });
});
