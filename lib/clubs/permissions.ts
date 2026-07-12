import type { GroupKind, GroupRole } from "@prisma/client";

export function canAdminClub(role: GroupRole) { return role === "OWNER" || role === "ADMIN" || role === "OFFICER"; }
export function canManageMembers(role: GroupRole) { return role === "OWNER" || role === "ADMIN"; }
export function canPublishAnnouncement(role: GroupRole) { return canAdminClub(role); }
export function canManageChallenge(kind: GroupKind, role: GroupRole) { return role === "OWNER" || (kind === "OFFICIAL_CLUB" && (role === "ADMIN" || role === "OFFICER")); }

export function canChangeRole(actor: GroupRole, current: GroupRole, next: GroupRole) {
  if (current === "OWNER" || next === "OWNER") return false;
  if (actor === "OWNER") return true;
  if (actor === "ADMIN") return current !== "ADMIN" && next !== "ADMIN";
  return false;
}

