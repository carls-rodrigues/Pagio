import { signUpSchema, signInSchema } from "../schemas/auth.schema";

describe("signUpSchema", () => {
  it("accepts valid email and password", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signUpSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("email");
  });

  it("rejects password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("password");
  });

  it("rejects password of exactly 7 characters", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "1234567",
    });
    expect(result.success).toBe(false);
  });

  it("accepts password of exactly 8 characters", () => {
    const result = signUpSchema.safeParse({
      email: "user@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });
});

describe("signInSchema", () => {
  it("accepts valid email and password", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = signInSchema.safeParse({
      email: "not-an-email",
      password: "anypassword",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("email");
  });

  it("rejects empty password", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain("password");
  });
});
