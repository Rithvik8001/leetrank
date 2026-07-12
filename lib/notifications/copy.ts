import type { NotificationType } from "@prisma/client";

// The payload a notification row carries beyond recipient/actor. `buildNotification`
// turns a typed semantic event into this shape so all wording + deep links live in
// one place (mirrors lib/marketing/content.ts). Pure + unit-tested.
export type NotificationPayload = {
  type: NotificationType;
  groupId?: string;
  challengeId?: string;
  entityType?: string;
  entityId?: string;
  title: string;
  body?: string;
  href?: string;
};

export type NotificationSpec =
  | {
      kind: "CLUB_APPLICATION_APPROVED";
      groupId: string;
      clubName: string;
      slug: string;
    }
  | {
      kind: "CLUB_APPLICATION_REJECTED" | "CLUB_APPLICATION_CHANGES_REQUESTED";
      groupId: string;
      clubName: string;
      note?: string | null;
    }
  | {
      kind: "CLUB_MEMBERSHIP_APPROVED";
      groupId: string;
      clubName: string;
      slug: string;
    }
  | {
      kind: "CLUB_MEMBERSHIP_REJECTED";
      groupId: string;
      clubName: string;
      slug: string;
      note?: string | null;
    }
  | {
      kind: "CLUB_ANNOUNCEMENT_PUBLISHED";
      groupId: string;
      clubName: string;
      slug: string;
      announcementId: string;
      announcementTitle: string;
    }
  | {
      kind: "CLUB_ROLE_CHANGED";
      groupId: string;
      clubName: string;
      slug: string;
      role: string;
    }
  | {
      kind: "CLUB_MEMBER_REMOVED";
      groupId: string;
      clubName: string;
      blocked: boolean;
    }
  | {
      kind: "GROUP_MEMBER_JOINED";
      groupId: string;
      groupName: string;
      memberName: string;
    }
  | {
      kind: "GROUP_MEMBER_REMOVED";
      groupId: string;
      groupName: string;
    }
  | {
      kind:
        | "CHALLENGE_CREATED"
        | "CHALLENGE_STARTED"
        | "CHALLENGE_ENDING_SOON"
        | "CHALLENGE_FINISHED";
      groupId: string;
      challengeId: string;
      challengeTitle: string;
      finalDelta?: number | null;
    };

function roleLabel(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function buildNotification(spec: NotificationSpec): NotificationPayload {
  switch (spec.kind) {
    case "CLUB_APPLICATION_APPROVED":
      return {
        type: "CLUB_APPLICATION_APPROVED",
        groupId: spec.groupId,
        entityType: "ClubApplication",
        title: `${spec.clubName} is now an official club`,
        body: "Your club application was approved.",
        href: `/clubs/${spec.slug}`,
      };
    case "CLUB_APPLICATION_REJECTED":
      return {
        type: "CLUB_APPLICATION_REJECTED",
        groupId: spec.groupId,
        entityType: "ClubApplication",
        title: `Club application for ${spec.clubName} was declined`,
        body: spec.note ?? undefined,
        href: `/groups/${spec.groupId}`,
      };
    case "CLUB_APPLICATION_CHANGES_REQUESTED":
      return {
        type: "CLUB_APPLICATION_CHANGES_REQUESTED",
        groupId: spec.groupId,
        entityType: "ClubApplication",
        title: `Changes requested on your ${spec.clubName} application`,
        body: spec.note ?? undefined,
        href: `/groups/${spec.groupId}`,
      };
    case "CLUB_MEMBERSHIP_APPROVED":
      return {
        type: "CLUB_MEMBERSHIP_APPROVED",
        groupId: spec.groupId,
        entityType: "ClubMembershipApplication",
        title: `You joined ${spec.clubName}`,
        body: "Your membership application was approved.",
        href: `/clubs/${spec.slug}`,
      };
    case "CLUB_MEMBERSHIP_REJECTED":
      return {
        type: "CLUB_MEMBERSHIP_REJECTED",
        groupId: spec.groupId,
        entityType: "ClubMembershipApplication",
        title: `Your application to ${spec.clubName} was declined`,
        body: spec.note ?? undefined,
        href: `/clubs/${spec.slug}`,
      };
    case "CLUB_ANNOUNCEMENT_PUBLISHED":
      return {
        type: "CLUB_ANNOUNCEMENT_PUBLISHED",
        groupId: spec.groupId,
        entityType: "ClubAnnouncement",
        entityId: spec.announcementId,
        title: `${spec.clubName}: ${spec.announcementTitle}`,
        body: "New announcement from your club.",
        href: `/clubs/${spec.slug}`,
      };
    case "CLUB_ROLE_CHANGED":
      return {
        type: "CLUB_ROLE_CHANGED",
        groupId: spec.groupId,
        entityType: "Group",
        title: `Your role in ${spec.clubName} is now ${roleLabel(spec.role)}`,
        href: `/clubs/${spec.slug}`,
      };
    case "CLUB_MEMBER_REMOVED":
      return {
        type: "CLUB_MEMBER_REMOVED",
        groupId: spec.groupId,
        entityType: "Group",
        title: spec.blocked
          ? `You were blocked from ${spec.clubName}`
          : `You were removed from ${spec.clubName}`,
        href: "/clubs",
      };
    case "GROUP_MEMBER_JOINED":
      return {
        type: "GROUP_MEMBER_JOINED",
        groupId: spec.groupId,
        entityType: "Group",
        title: `${spec.memberName} joined ${spec.groupName}`,
        href: `/groups/${spec.groupId}`,
      };
    case "GROUP_MEMBER_REMOVED":
      return {
        type: "GROUP_MEMBER_REMOVED",
        groupId: spec.groupId,
        entityType: "Group",
        title: `You were removed from ${spec.groupName}`,
        href: "/groups",
      };
    case "CHALLENGE_CREATED":
      return {
        type: "CHALLENGE_CREATED",
        groupId: spec.groupId,
        challengeId: spec.challengeId,
        entityType: "GroupChallenge",
        entityId: spec.challengeId,
        title: `New challenge: ${spec.challengeTitle}`,
        href: `/groups/${spec.groupId}/challenges/${spec.challengeId}`,
      };
    case "CHALLENGE_STARTED":
      return {
        type: "CHALLENGE_STARTED",
        groupId: spec.groupId,
        challengeId: spec.challengeId,
        entityType: "GroupChallenge",
        entityId: spec.challengeId,
        title: `${spec.challengeTitle} has started`,
        body: "The challenge is now live — get solving.",
        href: `/groups/${spec.groupId}/challenges/${spec.challengeId}`,
      };
    case "CHALLENGE_ENDING_SOON":
      return {
        type: "CHALLENGE_ENDING_SOON",
        groupId: spec.groupId,
        challengeId: spec.challengeId,
        entityType: "GroupChallenge",
        entityId: spec.challengeId,
        title: `${spec.challengeTitle} ends tomorrow`,
        body: "Last day to move up the standings.",
        href: `/groups/${spec.groupId}/challenges/${spec.challengeId}`,
      };
    case "CHALLENGE_FINISHED":
      return {
        type: "CHALLENGE_FINISHED",
        groupId: spec.groupId,
        challengeId: spec.challengeId,
        entityType: "GroupChallenge",
        entityId: spec.challengeId,
        title: `${spec.challengeTitle} has finished`,
        body:
          spec.finalDelta != null
            ? `Your final result: +${spec.finalDelta}.`
            : "Final standings are in.",
        href: `/groups/${spec.groupId}/challenges/${spec.challengeId}`,
      };
  }
}
