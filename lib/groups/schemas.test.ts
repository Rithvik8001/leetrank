import { describe, expect, test } from "bun:test";

import { groupNameSchema } from "./schemas";

describe("groupNameSchema", () => {
  test("accepts a normal name", () => {
    const result = groupNameSchema.safeParse({ name: "Dorm 4B grinders" });
    expect(result.success).toBe(true);
  });

  test("trims surrounding whitespace", () => {
    const result = groupNameSchema.safeParse({ name: "  Friends  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Friends");
  });

  test("rejects names that are too short (after trim)", () => {
    expect(groupNameSchema.safeParse({ name: "a" }).success).toBe(false);
    expect(groupNameSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  test("rejects names longer than 40 characters", () => {
    expect(groupNameSchema.safeParse({ name: "x".repeat(41) }).success).toBe(false);
  });
});
