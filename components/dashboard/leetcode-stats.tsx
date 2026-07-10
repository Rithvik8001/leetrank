"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Award01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { syncLeetCodeStats } from "@/app/dashboard/actions";
import type { SyncResult } from "@/lib/leetcode-sync";
import type { LeetCodeBadge } from "@/lib/leetcode";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { LiveTag } from "@/components/standings";

type SyncStatus = "IDLE" | "PENDING" | "SUCCESS" | "FAILED";
const SYNC_COOLDOWN_MS = 15 * 60 * 1000;

function timeLabel(value: string | null) {
  if (!value) return "Not synced yet";
  return `Synced ${new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))}`;
}

function retryDelay(lastAttemptAt: string | null) {
  if (!lastAttemptAt) return 0;
  return Math.max(0, new Date(lastAttemptAt).getTime() + SYNC_COOLDOWN_MS - Date.now());
}

export function LeetCodeStats({
  username,
  status,
  error,
  lastSyncedAt,
  lastAttemptAt,
  stats,
  badges,
}: {
  username: string;
  status: SyncStatus;
  error: string | null;
  lastSyncedAt: string | null;
  lastAttemptAt: string | null;
  stats: Array<{ label: string; value: string }>;
  badges: LeetCodeBadge[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [remaining, setRemaining] = useState(() => retryDelay(lastAttemptAt));

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining(retryDelay(lastAttemptAt)), 1000);
    return () => window.clearInterval(timer);
  }, [lastAttemptAt, remaining]);

  const syncing = isPending || status === "PENDING";
  const cooldown = remaining > 0 && status !== "PENDING";
  const minutes = Math.max(1, Math.ceil(remaining / 60_000));

  function refresh() {
    startTransition(async () => {
      const result: SyncResult = await syncLeetCodeStats();
      if (result.ok) toast.success("LeetCode stats refreshed.");
      else toast.error(result.error);
      if (!result.ok && result.kind === "cooldown") {
        setRemaining(Math.max(0, new Date(result.retryAt).getTime() - Date.now()));
      }
      router.refresh();
    });
  }

  return (
    <section className="flex flex-col gap-5" aria-labelledby="leetcode-stats-heading">
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="leetcode-stats-heading" className="font-mono text-sm font-medium text-foreground">
                @{username}
              </h2>
              {syncing ? (
                <LiveTag>Syncing</LiveTag>
              ) : (
                <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
                  {status === "FAILED" ? "Sync failed" : status === "SUCCESS" ? "Current snapshot" : "Ready to sync"}
                </span>
              )}
            </div>
            <p className="mt-1.5 font-mono text-[0.68rem] text-muted-foreground tabular-nums">
              {timeLabel(lastSyncedAt)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={syncing || cooldown}
            onClick={refresh}
            className="sm:self-center"
          >
            {syncing ? <Spinner /> : <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />}
            {syncing ? "Refreshing" : cooldown ? `Try again in ${minutes}m` : "Refresh stats"}
          </Button>
        </div>

        {status === "FAILED" && error ? (
          <p className="border-b border-border bg-muted/30 px-5 py-3 text-sm text-muted-foreground">
            {error} Your previous stats are still shown below.
          </p>
        ) : null}

        <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-h-28 flex-col justify-between bg-card p-5">
              <span className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
                {stat.label}
              </span>
              <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[0.68rem] font-medium tracking-[0.16em] text-foreground uppercase">
            Earned badges
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">{badges.length}</span>
        </div>
        {badges.length ? (
          <div className="divide-y divide-border">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">
                  {badge.iconUrl ? (
                    <Image src={badge.iconUrl} alt="" width={28} height={28} className="size-7 object-contain" />
                  ) : (
                    <HugeiconsIcon icon={Award01Icon} strokeWidth={1.7} className="size-4 text-muted-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{badge.name}</p>
                  <p className="font-mono text-[0.68rem] text-muted-foreground">
                    {badge.earnedAt ? `Earned ${badge.earnedAt}` : "LeetCode badge"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-6 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Award01Icon} strokeWidth={1.7} className="size-4" />
            No badges reported by LeetCode.
          </div>
        )}
      </div>
    </section>
  );
}
