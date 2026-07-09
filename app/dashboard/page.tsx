import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SectionLabel } from "@/components/marketing/section-label";

function firstName(name: string) {
  return name.trim().split(" ")[0] || name;
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { university: true },
  });
  if (!user) {
    redirect("/login");
  }

  const stats = [
    {
      label: "Problems solved",
      value: (user.leetcodeTotalSolved ?? 0).toLocaleString(),
    },
    {
      label: "Global rank",
      value:
        user.leetcodeRanking != null
          ? `#${user.leetcodeRanking.toLocaleString()}`
          : "—",
    },
    {
      label: "LeetCode handle",
      value: user.leetcodeUsername ?? "—",
      mono: true,
    },
  ];

  return (
    <div className="flex flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Your dashboard</SectionLabel>
        <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">
          Welcome back, {firstName(user.name)}.
        </h1>
        {user.university ? (
          <p className="font-mono text-xs tracking-[0.06em] text-muted-foreground">
            Ranked at {user.university.name}
          </p>
        ) : null}
      </header>

      <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-3 bg-card p-6">
            <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
              {stat.label}
            </span>
            <span
              className={
                stat.mono
                  ? "truncate font-mono text-2xl text-foreground"
                  : "font-mono text-4xl font-semibold tracking-tight text-foreground tabular-nums"
              }
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {user.university ? (
        <Link
          href={`/universities/${user.university.slug}`}
          className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-foreground"
        >
          View your university&apos;s leaderboard
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            strokeWidth={2}
            className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      ) : null}
    </div>
  );
}
