import { describe, expect, test } from "bun:test";

import {
  generateInviteToken,
  INVITE_TOKEN_ALPHABET,
  INVITE_TOKEN_LENGTH,
} from "./invite-token";

describe("generateInviteToken", () => {
  test("has the configured length", () => {
    expect(generateInviteToken()).toHaveLength(INVITE_TOKEN_LENGTH);
  });

  test("only uses the ambiguity-free alphabet", () => {
    const token = generateInviteToken();
    for (const char of token) {
      expect(INVITE_TOKEN_ALPHABET).toContain(char);
    }
  });

  test("excludes ambiguous characters", () => {
    expect(INVITE_TOKEN_ALPHABET).not.toContain("0");
    expect(INVITE_TOKEN_ALPHABET).not.toContain("O");
    expect(INVITE_TOKEN_ALPHABET).not.toContain("1");
    expect(INVITE_TOKEN_ALPHABET).not.toContain("I");
    expect(INVITE_TOKEN_ALPHABET).not.toContain("L");
  });

  test("is effectively unique across many calls", () => {
    const tokens = new Set(Array.from({ length: 1000 }, () => generateInviteToken()));
    expect(tokens.size).toBe(1000);
  });
});
