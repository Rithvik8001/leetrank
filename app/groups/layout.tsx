import type { ReactNode } from "react";
import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { LogoutButton } from "@/components/auth/logout-button";

export default function GroupsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col border-x border-border">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur-xl">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/clubs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Clubs</Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
