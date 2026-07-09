"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ClipboardCopyIcon, CheckmarkCircleIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function StepVerifyInstructions({
  username,
  code,
  isPending,
  onVerify,
}: {
  username: string;
  code: string;
  isPending: boolean;
  onVerify: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the code manually.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground">Your verification code</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-2xl font-bold tracking-wider tabular-nums">
            {code}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Copy code"
            onClick={handleCopy}
          >
            <HugeiconsIcon
              icon={copied ? CheckmarkCircleIcon : ClipboardCopyIcon}
              strokeWidth={2}
            />
          </Button>
        </div>
      </div>

      <ol className="list-decimal space-y-1.5 pl-4 text-sm text-muted-foreground">
        <li>
          Go to{" "}
          <a
            href={`https://leetcode.com/${username}/`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-2"
          >
            your LeetCode profile
          </a>{" "}
          and click Edit Profile.
        </li>
        <li>Paste the code above into your &quot;Summary&quot; / About Me bio.</li>
        <li>Save your profile, then come back here and click Verify.</li>
      </ol>

      <Button
        type="button"
        size="lg"
        className="mt-2 w-full"
        disabled={isPending}
        onClick={onVerify}
      >
        {isPending ? <Spinner /> : "Verify"}
      </Button>
    </div>
  );
}
