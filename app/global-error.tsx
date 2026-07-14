"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset, unstable_retry }: { error: Error & { digest?: string }; reset: () => void; unstable_retry?: () => void }) {
  return <html lang="en"><body className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground"><main className="w-full max-w-md rounded-md border border-border bg-card p-8 text-center"><p className="font-mono text-xs tracking-[0.14em] text-gold uppercase">LeetRank</p><h1 className="mt-4 font-heading text-3xl font-extrabold tracking-[-0.03em]">The app could not load</h1><p className="mt-3 text-sm text-muted-foreground">Retry the request. If the problem continues, check system health.</p><Button className="mt-6" onClick={() => (unstable_retry ?? reset)()}>Try again</Button></main></body></html>;
}

