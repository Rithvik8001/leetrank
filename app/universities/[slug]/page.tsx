import Link from "next/link";
import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Globe02Icon } from "@hugeicons/core-free-icons";

import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SectionLabel } from "@/components/marketing/section-label";

const OWNERSHIP_LABEL: Record<string, string> = {
  PUBLIC: "Public",
  PRIVATE_NONPROFIT: "Private nonprofit",
  PRIVATE_FOR_PROFIT: "Private for-profit",
};

const podiumTextStyles: Record<number, string> = {
  1: "text-rank-gold",
  2: "text-rank-silver",
  3: "text-rank-bronze",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function UniversityProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const university = await prisma.university.findUnique({ where: { slug } });
  if (!university) {
    notFound();
  }

  const leaderboard = await prisma.user.findMany({
    where: { universityId: university.id, leetcodeVerified: true },
    orderBy: { leetcodeTotalSolved: "desc" },
    select: {
      id: true,
      name: true,
      image: true,
      leetcodeUsername: true,
      leetcodeTotalSolved: true,
      leetcodeRanking: true,
    },
  });

  return (
    <div className="flex flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-3">
        <SectionLabel>University profile</SectionLabel>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            {university.name}
          </h1>
          {university.ownershipType ? (
            <Badge variant="secondary">
              {OWNERSHIP_LABEL[university.ownershipType] ??
                university.ownershipType}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {university.city}, {university.state}
        </p>
        {university.website ? (
          <a
            href={university.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
          >
            <HugeiconsIcon icon={Globe02Icon} strokeWidth={2} className="size-4" />
            {university.website.replace(/^https?:\/\//, "")}
          </a>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          Leaderboard
        </h2>

        {leaderboard.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No ranked students yet</EmptyTitle>
              <EmptyDescription>
                Once students from {university.name} verify their LeetCode
                account, they&apos;ll show up here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Solved</TableHead>
                  <TableHead className="text-right">Global rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((student, index) => {
                  const rank = index + 1;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <span
                          className={cn(
                            "font-mono text-base font-bold tabular-nums",
                            podiumTextStyles[rank] ?? "text-muted-foreground",
                          )}
                        >
                          {rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {initials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {student.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {student.leetcodeUsername}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {student.leetcodeTotalSolved ?? 0}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                        {student.leetcodeRanking ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Link
        href="/universities"
        className="w-fit text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        ← Back to all universities
      </Link>
    </div>
  );
}
