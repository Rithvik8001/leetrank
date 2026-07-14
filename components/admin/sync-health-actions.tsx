"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { releaseStaleLeases, resumeSyncRun, retrySyncItem, retryTerminalStage } from "@/app/admin/health/actions";

export function HealthAction({ label, action }: { label: string; action: () => Promise<{ ok: boolean; error?: string }> }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(async () => {
        const result = await action();
        if (result.ok) toast.success(`${label} queued.`);
        else toast.error(result.error ?? "The recovery action failed.");
      })}
    >
      {pending ? <Spinner /> : label}
    </Button>
  );
}

export function ResumeRunButton({ runId }: { runId: string }) {
  return <HealthAction label="Resume run" action={() => resumeSyncRun(runId)} />;
}
export function RetryItemButton({ itemId }: { itemId: string }) {
  return <HealthAction label="Retry item" action={() => retrySyncItem(itemId)} />;
}
export function RetryStageButton({ runId }: { runId: string }) {
  return <HealthAction label="Retry stage" action={() => retryTerminalStage(runId)} />;
}
export function ReleaseLeasesButton() {
  return <HealthAction label="Release stale leases" action={releaseStaleLeases} />;
}
