import { describe, expect, test } from "bun:test";
import {
  canAdminClub,
  canChangeRole,
  canManageChallenge,
  canManageMembers,
} from "./permissions";

describe("club permissions", () => {
  test("fixed roles expose intended administration levels", () => {
    expect(canAdminClub("OFFICER")).toBe(true);
    expect(canManageMembers("OFFICER")).toBe(false);
    expect(canManageMembers("ADMIN")).toBe(true);
  });
  test("only owners can grant or remove admin", () => {
    expect(canChangeRole("OWNER", "MEMBER", "ADMIN")).toBe(true);
    expect(canChangeRole("ADMIN", "MEMBER", "ADMIN")).toBe(false);
    expect(canChangeRole("ADMIN", "OFFICER", "MEMBER")).toBe(true);
    expect(canChangeRole("OWNER", "OWNER", "ADMIN")).toBe(false);
  });
  test("official officers can manage challenges but casual officers cannot", () => {
    expect(canManageChallenge("OFFICIAL_CLUB", "OFFICER")).toBe(true);
    expect(canManageChallenge("CASUAL", "OFFICER")).toBe(false);
  });
});
