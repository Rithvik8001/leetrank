import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requirePlatformAdmin } from "@/lib/clubs/auth";
import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export default async function AdminLayout({children}:{children:ReactNode}) {
  if(!await requirePlatformAdmin()) redirect("/dashboard");
  return <div className="mx-auto min-h-screen max-w-6xl border-x border-border">
    <header className="flex h-16 items-center justify-between border-b border-border px-6">
      <Link href="/dashboard" aria-label="LeetRank dashboard"><Wordmark /></Link>
      <nav className="flex gap-5 text-sm text-muted-foreground" aria-label="Administration">
        <Link href="/admin/clubs" className="hover:text-foreground">Club reviews</Link>
        <Link href="/admin/health" className="hover:text-foreground">System health</Link>
      </nav>
    </header>
    {children}
  </div>;
}
