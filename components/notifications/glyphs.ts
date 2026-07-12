// A small mono glyph per notification type, mirroring the activity-feed GLYPH map
// (components/universities/university-activity.tsx). Brass marks the celebratory /
// positive events; everything else stays muted ink.
export const NOTIFICATION_GLYPH: Record<string, { symbol: string; brass: boolean }> = {
  CLUB_APPLICATION_APPROVED: { symbol: "★", brass: true },
  CLUB_APPLICATION_REJECTED: { symbol: "×", brass: false },
  CLUB_APPLICATION_CHANGES_REQUESTED: { symbol: "!", brass: false },
  CLUB_MEMBERSHIP_APPROVED: { symbol: "+", brass: true },
  CLUB_MEMBERSHIP_REJECTED: { symbol: "×", brass: false },
  CLUB_ANNOUNCEMENT_PUBLISHED: { symbol: "◆", brass: false },
  CLUB_ROLE_CHANGED: { symbol: "◇", brass: false },
  CLUB_MEMBER_REMOVED: { symbol: "×", brass: false },
  GROUP_MEMBER_JOINED: { symbol: "+", brass: false },
  GROUP_MEMBER_REMOVED: { symbol: "×", brass: false },
  CHALLENGE_CREATED: { symbol: "◆", brass: false },
  CHALLENGE_STARTED: { symbol: "▲", brass: true },
  CHALLENGE_ENDING_SOON: { symbol: "!", brass: true },
  CHALLENGE_FINISHED: { symbol: "★", brass: true },
};

export function glyphFor(type: string): { symbol: string; brass: boolean } {
  return NOTIFICATION_GLYPH[type] ?? { symbol: "•", brass: false };
}
