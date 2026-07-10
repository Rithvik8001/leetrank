import { prisma } from "@/lib/prisma";

export type SnapshotPoint = {
  capturedAt: Date;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  ranking: number | null;
};

const snapshotPointSelect = {
  capturedAt: true,
  totalSolved: true,
  easySolved: true,
  mediumSolved: true,
  hardSolved: true,
  contestRating: true,
  ranking: true,
} as const;

// Historical stat points for a user, oldest first — the source for future
// rating-over-time / solved-over-time charts.
export async function getUserSnapshots(
  userId: string,
  opts: { since?: Date; limit?: number } = {},
): Promise<SnapshotPoint[]> {
  return prisma.leetcodeSnapshot.findMany({
    where: {
      userId,
      ...(opts.since ? { capturedAt: { gte: opts.since } } : {}),
    },
    orderBy: { capturedAt: "asc" },
    take: opts.limit,
    select: snapshotPointSelect,
  });
}

// The user's stats "as of" a past day — the latest snapshot on or before `cutoff`.
// Null when the user has no snapshot that old (history doesn't reach the window).
export async function getSnapshotAsOf(
  userId: string,
  cutoff: Date,
): Promise<SnapshotPoint | null> {
  return prisma.leetcodeSnapshot.findFirst({
    where: { userId, capturedOn: { lte: cutoff } },
    orderBy: { capturedOn: "desc" },
    select: snapshotPointSelect,
  });
}

// The user's oldest snapshot — used to mark a week/month window "partial" for
// users whose history doesn't reach back the full window.
export async function getEarliestSnapshot(
  userId: string,
): Promise<SnapshotPoint | null> {
  return prisma.leetcodeSnapshot.findFirst({
    where: { userId },
    orderBy: { capturedOn: "asc" },
    select: snapshotPointSelect,
  });
}
