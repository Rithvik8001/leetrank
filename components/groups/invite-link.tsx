"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, Copy01Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { regenerateInvite } from "@/app/groups/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteLink({
  inviteUrl,
  groupId,
  isOwner,
}: {
  inviteUrl: string;
  groupId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn’t copy the link.");
    }
  }

  function regenerate() {
    startTransition(async () => {
      const result = await regenerateInvite(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("New invite link generated. The old link no longer works.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input readOnly value={inviteUrl} className="font-mono text-xs" aria-label="Invite link" />
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={copy} className="shrink-0">
          <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} strokeWidth={2} />
          {copied ? "Copied" : "Copy"}
        </Button>
        {isOwner ? (
          <Button
            type="button"
            variant="ghost"
            onClick={regenerate}
            disabled={isPending}
            className="shrink-0"
          >
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
            Regenerate
          </Button>
        ) : null}
      </div>
    </div>
  );
}
