import { prisma } from "@/lib/prisma";
import { CLUB_PAGE_SIZE } from "@/lib/clubs/constants";
import { daysAgo } from "@/lib/users/progress";

export async function getPublicClubs(input: {
  query?: string;
  university?: string;
  state?: string;
  sort?: string;
  page?: number;
}) {
  const page = Math.max(1, input.page ?? 1);
  const where = {
    kind: "OFFICIAL_CLUB" as const,
    suspendedAt: null,
    ...(input.university ? { university: { slug: input.university } } : {}),
    ...(input.state ? { university: { state: input.state } } : {}),
    ...(input.query
      ? {
          OR: [
            { name: { contains: input.query, mode: "insensitive" as const } },
            {
              university: {
                name: { contains: input.query, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };
  const orderBy =
    input.sort === "members"
      ? { memberships: { _count: "desc" as const } }
      : input.sort === "recent"
        ? { updatedAt: "desc" as const }
        : { name: "asc" as const };
  const [clubs, total] = await Promise.all([
    prisma.group.findMany({
      where,
      orderBy,
      skip: (page - 1) * CLUB_PAGE_SIZE,
      take: CLUB_PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        updatedAt: true,
        university: { select: { name: true, slug: true, state: true } },
        _count: {
          select: {
            memberships: { where: { status: "ACTIVE" } },
            challenges: { where: { endsOn: { gte: new Date() } } },
          },
        },
      },
    }),
    prisma.group.count({ where }),
  ]);
  return {
    clubs,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / CLUB_PAGE_SIZE)),
  };
}

export async function getPublicClub(slug: string) {
  return prisma.group.findFirst({
    where: { slug, kind: "OFFICIAL_CLUB", suspendedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      contactEmail: true,
      websiteUrl: true,
      githubUrl: true,
      discordUrl: true,
      approvedAt: true,
      universityId: true,
      university: {
        select: { name: true, slug: true, city: true, state: true },
      },
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        select: {
          role: true,
          publicOfficerVisible: true,
          user: {
            select: {
              id: true,
              name: true,
              leetcodeUsername: true,
              leetcodeTotalSolved: true,
              leetcodeEasySolved: true,
              leetcodeMediumSolved: true,
              leetcodeHardSolved: true,
              leetcodeRanking: true,
              leetcodeContestRating: true,
              leetcodeLastSyncedAt: true,
              publicProfileEnabled: true,
              publicProfileHandle: true,
              leetcodeVerified: true,
            },
          },
        },
      },
      challenges: {
        where: { endsOn: { gte: new Date() } },
        orderBy: { startsOn: "asc" },
        take: 3,
        select: {
          id: true,
          title: true,
          metric: true,
          startsOn: true,
          endsOn: true,
          _count: { select: { participants: true } },
        },
      },
      announcements: {
        where: { visibility: "PUBLIC", archivedAt: null },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          body: true,
          publishedAt: true,
          updatedAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });
}

export async function getClubAdminData(groupId: string) {
  const week = daysAgo(new Date(), 7);
  const month = daysAgo(new Date(), 30);
  const now = new Date();
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      kind: true,
      slug: true,
      suspendedAt: true,
      owner: { select: { name: true } },
      memberships: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              leetcodeUsername: true,
              leetcodeTotalSolved: true,
              leetcodeLastSyncedAt: true,
              leetcodeSnapshots: {
                where: { capturedOn: { gte: week } },
                orderBy: { capturedOn: "asc" },
                select: { totalSolved: true },
              },
            },
          },
        },
      },
      membershipApplications: {
        where: { status: "PENDING" },
        orderBy: { submittedAt: "asc" },
        select: {
          id: true,
          message: true,
          submittedAt: true,
          user: { select: { id: true, name: true, leetcodeUsername: true } },
        },
      },
      challenges: {
        where: { startsOn: { lte: now }, endsOn: { gte: now } },
        select: {
          id: true,
          title: true,
          startsOn: true,
          participants: { select: { userId: true } },
        },
      },
      clubApplications: {
        where: { status: "CHANGES_REQUESTED" },
        take: 1,
        select: { reviewNote: true },
      },
    },
  });
  if (!group) return null;
  const active = group.memberships.filter((m) => {
    const s = m.user.leetcodeSnapshots;
    return s.length > 1 && s.at(-1)!.totalSolved > s[0]!.totalSolved;
  }).length;
  const stale = group.memberships.filter(
    (m) => !m.user.leetcodeLastSyncedAt || m.user.leetcodeLastSyncedAt < week,
  ).length;
  const participants = new Set(
    group.challenges.flatMap((c) => c.participants.map((p) => p.userId)),
  ).size;
  return {
    ...group,
    metrics: {
      activeMembers: group.memberships.length,
      newMembers: group.memberships.filter((m) => m.createdAt >= month).length,
      pendingApplications: group.membershipApplications.length,
      activeThisWeek: active,
      staleSync: stale,
      participationRate: group.memberships.length
        ? Math.round((participants / group.memberships.length) * 100)
        : 0,
      officerCount: group.memberships.filter((m) => m.role !== "MEMBER").length,
    },
  };
}

export async function getClubAnnouncements(groupId: string) {
  return prisma.clubAnnouncement.findMany({
    where: { groupId, archivedAt: null },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      visibility: true,
      publishedAt: true,
      updatedAt: true,
      authorId: true,
      author: { select: { name: true } },
    },
  });
}

export async function getAdminClubApplications() {
  return prisma.clubApplication.findMany({
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      status: true,
      proposedName: true,
      requestedSlug: true,
      description: true,
      officialWebsiteUrl: true,
      facultyAdvisorName: true,
      facultyAdvisorEmail: true,
      contactEmail: true,
      githubUrl: true,
      discordUrl: true,
      evidenceNote: true,
      submittedAt: true,
      reviewNote: true,
      group: {
        select: {
          id: true,
          kind: true,
          suspendedAt: true,
          _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
        },
      },
      university: { select: { name: true } },
      submittedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
  });
}
