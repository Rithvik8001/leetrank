import { prisma } from "@/lib/prisma";
import { WEEK_DAYS, daysAgo } from "@/lib/users/progress";

export const ACTIVITY_WINDOW_DAYS = 2 * WEEK_DAYS; // rolling 14-day window
export const ACTIVITY_LIMIT = 25;
export const NOTABLE_SOLVED = 5; // min single-day solved jump to surface a plain "solved" event

export const SOLVED_MILESTONES = [
  50, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 2000, 2500, 3000,
];
export const RATING_MILESTONES = [
  1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2400, 2600, 3000,
];

export type ActivityType =
  | "solved"
  | "milestone-solved"
  | "rating"
  | "milestone-rating"
  | "joined";

export type ActivityActor = {
  id: string;
  name: string;
  username: string | null;
  profileHref: string | null;
};

export type ActivityEvent = {
  id: string;
  type: ActivityType;
  at: Date;
  actor: ActivityActor;
  value: number; // solved delta / milestone threshold / rating delta
};

export type SnapshotStep = {
  at: Date;
  totalSolved: number;
  contestRating: number | null;
};

// The highest threshold strictly crossed moving from `prev` to `curr`
// (prev < t <= curr), or null when none was crossed.
export function crossedMilestone(
  prev: number,
  curr: number,
  thresholds: number[],
): number | null {
  let crossed: number | null = null;
  for (const threshold of thresholds) {
    if (prev < threshold && threshold <= curr) crossed = threshold;
  }
  return crossed;
}

function dayKey(at: Date): string {
  return at.toISOString().slice(0, 10);
}

// Notable events for one user's snapshot series (oldest first). Consecutive
// snapshots are one UTC day apart, so each pair is a day's worth of movement.
export function deriveEvents(
  actor: ActivityActor,
  series: SnapshotStep[],
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1];
    const curr = series[i];

    const solvedMilestone = crossedMilestone(prev.totalSolved, curr.totalSolved, SOLVED_MILESTONES);
    if (solvedMilestone != null) {
      events.push({
        id: `${actor.id}:milestone-solved:${dayKey(curr.at)}`,
        type: "milestone-solved",
        at: curr.at,
        actor,
        value: solvedMilestone,
      });
    } else {
      const delta = curr.totalSolved - prev.totalSolved;
      if (delta >= NOTABLE_SOLVED) {
        events.push({
          id: `${actor.id}:solved:${dayKey(curr.at)}`,
          type: "solved",
          at: curr.at,
          actor,
          value: delta,
        });
      }
    }

    if (prev.contestRating != null && curr.contestRating != null && curr.contestRating > prev.contestRating) {
      const ratingMilestone = crossedMilestone(prev.contestRating, curr.contestRating, RATING_MILESTONES);
      if (ratingMilestone != null) {
        events.push({
          id: `${actor.id}:milestone-rating:${dayKey(curr.at)}`,
          type: "milestone-rating",
          at: curr.at,
          actor,
          value: ratingMilestone,
        });
      } else {
        events.push({
          id: `${actor.id}:rating:${dayKey(curr.at)}`,
          type: "rating",
          at: curr.at,
          actor,
          value: Math.round(curr.contestRating - prev.contestRating),
        });
      }
    }
  }

  return events;
}

// A "joined the leaderboard" event when the user verified within the window.
export function joinEvent(
  actor: ActivityActor,
  verifiedAt: Date | null,
  since: Date,
): ActivityEvent | null {
  if (verifiedAt == null || verifiedAt < since) return null;
  return { id: `${actor.id}:joined`, type: "joined", at: verifiedAt, actor, value: 0 };
}

type FeedUser = {
  id: string;
  name: string;
  leetcodeUsername: string | null;
  publicProfileEnabled: boolean;
  publicProfileHandle: string | null;
  leetcodeVerifiedAt: Date | null;
};

function toActor(user: FeedUser): ActivityActor {
  return {
    id: user.id,
    name: user.name,
    username: user.leetcodeUsername,
    profileHref:
      user.publicProfileEnabled && user.publicProfileHandle
        ? `/u/${user.publicProfileHandle}`
        : null,
  };
}

export async function getCampusActivityFeed(
  universityId: string,
  now = new Date(),
  limit = ACTIVITY_LIMIT,
): Promise<ActivityEvent[]> {
  const since = daysAgo(now, ACTIVITY_WINDOW_DAYS);

  const [users, snapshots] = await Promise.all([
    prisma.user.findMany({
      where: { universityId, leetcodeVerified: true },
      select: {
        id: true,
        name: true,
        leetcodeUsername: true,
        publicProfileEnabled: true,
        publicProfileHandle: true,
        leetcodeVerifiedAt: true,
      },
    }),
    prisma.leetcodeSnapshot.findMany({
      where: { capturedOn: { gte: since }, user: { universityId, leetcodeVerified: true } },
      orderBy: [{ userId: "asc" }, { capturedAt: "asc" }],
      select: { userId: true, capturedAt: true, totalSolved: true, contestRating: true },
    }),
  ]);

  const seriesByUser = new Map<string, SnapshotStep[]>();
  for (const row of snapshots) {
    const step: SnapshotStep = {
      at: row.capturedAt,
      totalSolved: row.totalSolved,
      contestRating: row.contestRating,
    };
    const existing = seriesByUser.get(row.userId);
    if (existing) existing.push(step);
    else seriesByUser.set(row.userId, [step]);
  }

  const events: ActivityEvent[] = [];
  for (const user of users) {
    const actor = toActor(user);
    events.push(...deriveEvents(actor, seriesByUser.get(user.id) ?? []));
    const joined = joinEvent(actor, user.leetcodeVerifiedAt, since);
    if (joined) events.push(joined);
  }

  return events
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}
