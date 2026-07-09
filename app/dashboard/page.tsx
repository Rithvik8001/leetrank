import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionLabel } from "@/components/marketing/section-label";

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

  return (
    <div className="flex flex-col gap-6 px-6 py-10">
      <Card className="max-w-md p-2">
        <CardHeader className="gap-3 px-4 pt-3">
          <SectionLabel>Welcome</SectionLabel>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {user.name}
          </h1>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 pb-3 text-sm text-muted-foreground">
          {user.university ? (
            <p>
              You&apos;re ranked at{" "}
              <span className="font-medium text-foreground">
                {user.university.name}
              </span>
              .
            </p>
          ) : null}
          <p>
            Total solved:{" "}
            <span className="font-mono font-medium text-foreground tabular-nums">
              {user.leetcodeTotalSolved ?? 0}
            </span>
          </p>
          {user.university ? (
            <Link
              href={`/universities/${user.university.slug}`}
              className="w-fit text-primary underline-offset-2 hover:underline"
            >
              View your university&apos;s leaderboard →
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
