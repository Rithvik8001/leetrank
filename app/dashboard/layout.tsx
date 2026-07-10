import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wordmark } from "@/components/wordmark";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur-xl">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-5">
          <Link
            href="/universities"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Universities
          </Link>
          <Link
            href="/groups"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Groups
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
