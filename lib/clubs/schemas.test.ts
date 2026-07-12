import { describe, expect, test } from "bun:test";
import {
  announcementSchema,
  clubApplicationSchema,
  normalizeClubSlug,
} from "./schemas";

const valid = {
  proposedName: "State University ACM",
  requestedSlug: "state-acm",
  description:
    "A university coding club focused on contests and peer learning.",
  officialWebsiteUrl: "https://example.edu/acm",
  facultyAdvisorName: "Professor Ada Lovelace",
  facultyAdvisorEmail: "ada@example.edu",
  contactEmail: "acm@example.edu",
  githubUrl: "",
  discordUrl: "",
  evidenceNote:
    "We are a recognized campus organization with active officers and weekly programming practice meetings.",
};

describe("club schemas", () => {
  test("normalizes and validates a club application", () => {
    const parsed = clubApplicationSchema.parse({
      ...valid,
      requestedSlug: " State ACM! ",
    });
    expect(parsed.requestedSlug).toBe("state-acm");
    expect(parsed.githubUrl).toBeNull();
  });
  test("rejects insecure links and reserved slugs", () => {
    expect(
      clubApplicationSchema.safeParse({
        ...valid,
        officialWebsiteUrl: "http://example.edu",
      }).success,
    ).toBe(false);
    expect(
      clubApplicationSchema.safeParse({ ...valid, requestedSlug: "admin" })
        .success,
    ).toBe(false);
  });
  test("announcement limits are enforced", () => {
    expect(
      announcementSchema.safeParse({
        title: "Hi",
        body: "Update",
        visibility: "PUBLIC",
      }).success,
    ).toBe(false);
    expect(
      announcementSchema.safeParse({
        title: "Practice update",
        body: "Tonight at seven.",
        visibility: "MEMBERS",
      }).success,
    ).toBe(true);
  });
  test("slug normalization is stable", () =>
    expect(normalizeClubSlug("  ACM @ UMass  ")).toBe("acm-umass"));
});
