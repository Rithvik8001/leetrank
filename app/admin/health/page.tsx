import { SyncRunStatus } from "@prisma/client";

import { SectionLabel } from "@/components/marketing/section-label";
import { Ledger, LedgerRow, LiveTag, StatCell, StatTile } from "@/components/standings";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getSyncHealth } from "@/lib/sync-health";
import { ReleaseLeasesButton, ResumeRunButton, RetryItemButton, RetryStageButton } from "@/components/admin/sync-health-actions";

function stamp(value: Date | null) {
  return value ? value.toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC" : "—";
}

export default async function AdminHealthPage() {
  const health = await getSyncHealth();
  const current = health.runs.find((run) => run.status === "RUNNING" || run.status === "QUEUED") ?? health.runs[0];
  const total = current?._count.items ?? 0;
  const successful = current ? (current.counts.SUCCEEDED ?? 0) + (current.counts.SKIPPED ?? 0) : 0;
  const failed = current?.counts.FAILED ?? 0;
  const successRate = total ? `${Math.round((successful / total) * 100)}%` : "—";

  return (
    <main>
      <header className="border-b border-border px-6 py-12">
        <SectionLabel>Platform administration</SectionLabel>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em]">System health</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">Durable LeetCode sync runs, worker leases, and scheduled challenge stages.</p>
          </div>
          {health.staleLeases ? <ReleaseLeasesButton /> : null}
        </div>
      </header>

      <section className="grid gap-px border-b border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Current run" value={current?.status ?? "—"} hint={current?.scheduledFor.toISOString().slice(0, 10)} />
        <StatTile label="Success rate" value={successRate} hint={`${successful} of ${total} complete`} />
        <StatTile label="Failed items" value={failed} hint="after retries" />
        <StatTile label="Stale leases" value={health.staleLeases} hint="older than 10 min" />
        <StatTile label="Last success" value={health.lastSuccessful ? health.lastSuccessful.scheduledFor.toISOString().slice(5, 10) : "—"} hint={stamp(health.lastSuccessful?.finishedAt ?? null)} />
      </section>

      <section className="px-6 py-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <SectionLabel>Recent runs</SectionLabel>
          {current?.status === SyncRunStatus.RUNNING ? <LiveTag>Processing</LiveTag> : null}
        </div>
        {!health.runs.length ? (
          <Empty className="rounded-md border border-border">
            <EmptyHeader><EmptyTitle>No sync runs yet</EmptyTitle><EmptyDescription>The first run appears after the next scheduled tick at or after 06:00 UTC.</EmptyDescription></EmptyHeader>
          </Empty>
        ) : (
          <Ledger>
            {health.runs.map((run) => {
              const complete = (run.counts.SUCCEEDED ?? 0) + (run.counts.SKIPPED ?? 0);
              const terminalIncomplete = !run.challengeFinalizedAt || !run.challengeNotificationsAt;
              return (
                <div key={run.id}>
                  <LedgerRow leader={run.status === "RUNNING"} className="grid-cols-[1fr_auto]">
                    <div>
                      <p className="font-mono text-sm tabular-nums">{run.scheduledFor.toISOString().slice(0, 10)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{run.status} · started {stamp(run.startedAt)}</p>
                    </div>
                    <StatCell value={`${complete}/${run._count.items}`} label={`${run.counts.FAILED ?? 0} failed`} />
                  </LedgerRow>
                  <details className="border-t border-border bg-muted/10 px-5 py-4">
                    <summary className="cursor-pointer font-mono text-xs text-muted-foreground">Inspect run</summary>
                    <div className="mt-4 grid gap-4 text-sm lg:grid-cols-2">
                      <dl className="grid grid-cols-2 gap-3 font-mono text-xs tabular-nums">
                        <div><dt className="text-muted-foreground">Heartbeat</dt><dd>{stamp(run.heartbeatAt)}</dd></div>
                        <div><dt className="text-muted-foreground">Finished</dt><dd>{stamp(run.finishedAt)}</dd></div>
                        <div><dt className="text-muted-foreground">Finalization</dt><dd>{stamp(run.challengeFinalizedAt)}</dd></div>
                        <div><dt className="text-muted-foreground">Notifications</dt><dd>{stamp(run.challengeNotificationsAt)}</dd></div>
                      </dl>
                      <div className="flex flex-wrap items-start justify-end gap-2">
                        {run.status === "PARTIAL" || run.status === "FAILED" ? <ResumeRunButton runId={run.id} /> : null}
                        {run.status === "FAILED" && terminalIncomplete ? <RetryStageButton runId={run.id} /> : null}
                      </div>
                    </div>
                    {run.lastError ? <p className="mt-4 text-xs text-muted-foreground">{run.lastErrorCode}: {run.lastError}</p> : null}
                    {run.items.length ? (
                      <div className="mt-4 divide-y divide-border border-y border-border">
                        {run.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                            <div className="min-w-0 text-xs"><p className="font-mono">{item.lastErrorCode ?? "FAILED"} · {item.attempts} attempts</p><p className="truncate text-muted-foreground">{item.lastError}</p></div>
                            <RetryItemButton itemId={item.id} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </details>
                </div>
              );
            })}
          </Ledger>
        )}
      </section>
    </main>
  );
}
