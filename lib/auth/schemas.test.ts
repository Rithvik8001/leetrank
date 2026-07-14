import { describe, expect, test } from "bun:test";
import { changePasswordSchema } from "@/lib/auth/schemas";

describe("changePasswordSchema", () => {
  test("accepts a distinct matching password", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "old-pass-123", newPassword: "new-pass-456", confirmPassword: "new-pass-456" }).success).toBe(true);
  });
  test("rejects reuse and mismatched confirmation", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "same-pass", newPassword: "same-pass", confirmPassword: "different" }).success).toBe(false);
  });
  test("matches Better Auth password length limits", () => {
    expect(changePasswordSchema.safeParse({ currentPassword: "1234567", newPassword: "12345678", confirmPassword: "12345678" }).success).toBe(false);
    const tooLong = "x".repeat(129);
    expect(changePasswordSchema.safeParse({ currentPassword: "valid-pass", newPassword: tooLong, confirmPassword: tooLong }).success).toBe(false);
  });
});
