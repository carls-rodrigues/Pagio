import { createVendorSchema } from "../schemas/vendor.schema";

describe("createVendorSchema", () => {
  it("accepts valid input", () => {
    const result = createVendorSchema.safeParse({
      name: "Acme Corp",
      email: "billing@acme.com",
      taxId: "US123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createVendorSchema.safeParse({
      name: "",
      email: "billing@acme.com",
      taxId: "US123456789",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Name is required");
  });

  it("rejects invalid email", () => {
    const result = createVendorSchema.safeParse({
      name: "Acme",
      email: "not-an-email",
      taxId: "US123456789",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Invalid email address");
  });

  it("rejects empty taxId", () => {
    const result = createVendorSchema.safeParse({
      name: "Acme",
      email: "billing@acme.com",
      taxId: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Tax ID is required");
  });
});
