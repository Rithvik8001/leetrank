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
    select: {
      capturedAt: true,
      totalSolved: true,
      easySolved: true,
      mediumSolved: true,
      hardSolved: true,
      contestRating: true,
      ranking: true,
    },
  });
}
