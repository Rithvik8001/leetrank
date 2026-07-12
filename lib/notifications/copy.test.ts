import { describe, expect, test } from "bun:test";

import { buildNotification } from "./copy";

describe("buildNotification", () => {
  test("club application approved deep-links to the public club page", () => {
    const n = buildNotification({
      kind: "CLUB_APPLICATION_APPROVED",
      groupId: "g1",
      clubName: "ACM",
      slug: "acm-state",
    });
    expect(n.type).toBe("CLUB_APPLICATION_APPROVED");
    expect(n.href).toBe("/clubs/acm-state");
    expect(n.title).toContain("ACM");
  });

  test("rejected application links back to the group and carries the note", () => {
    const n = buildNotification({
      kind: "CLUB_APPLICATION_REJECTED",
      groupId: "g1",
      clubName: "ACM",
      note: "Needs a faculty advisor.",
    });
    expect(n.href).toBe("/groups/g1");
    expect(n.body).toBe("Needs a faculty advisor.");
  });

  test("announcement carries the entity id and club deep link", () => {
    const n = buildNotification({
      kind: "CLUB_ANNOUNCEMENT_PUBLISHED",
      groupId: "g1",
      clubName: "ACM",
      slug: "acm",
      announcementId: "a1",
      announcementTitle: "Meetup Friday",
    });
    expect(n.entityId).toBe("a1");
    expect(n.href).toBe("/clubs/acm");
    expect(n.title).toContain("Meetup Friday");
  });

  test("role change renders a title-cased role", () => {
    const n = buildNotification({
      kind: "CLUB_ROLE_CHANGED",
      groupId: "g1",
      clubName: "ACM",
      slug: "acm",
      role: "OFFICER",
    });
    expect(n.title).toContain("Officer");
  });

  test("challenge finished includes the final delta when present", () => {
    const n = buildNotification({
      kind: "CHALLENGE_FINISHED",
      groupId: "g1",
      challengeId: "c1",
      challengeTitle: "July Sprint",
      finalDelta: 42,
    });
    expect(n.href).toBe("/groups/g1/challenges/c1");
    expect(n.body).toContain("42");
  });

  test("challenge finished falls back when delta is null", () => {
    const n = buildNotification({
      kind: "CHALLENGE_FINISHED",
      groupId: "g1",
      challengeId: "c1",
      challengeTitle: "July Sprint",
      finalDelta: null,
    });
    expect(n.body).toBe("Final standings are in.");
  });
});
