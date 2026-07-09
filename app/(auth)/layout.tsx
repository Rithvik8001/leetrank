import type { ReactNode } from "react";
import Link from "next/link";

import { Wordmark } from "@/components/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden="true"
        className="bg-dotted pointer-events-none absolute inset-0 mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] opacity-60"
      />
      <header className="relative flex items-center justify-between px-6 py-6">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>
        <ThemeToggle />
      </header>
      <main className="relative flex flex-1 items-center justify-center px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
