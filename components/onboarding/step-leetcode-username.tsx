"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  CodeSquareIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { leetcodeUsernameSchema } from "@/lib/onboarding/schemas";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export function StepLeetcodeUsername({
  defaultUsername,
  isPending,
  onSubmit,
}: {
  defaultUsername: string | null;
  isPending: boolean;
  onSubmit: (username: string) => void;
}) {
  const [username, setUsername] = useState(defaultUsername ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = leetcodeUsernameSchema.safeParse({ username });
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid username";
      setError(message);
      toast.error(message);
      return;
    }
    setError(null);
    onSubmit(result.data.username);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leetcode-username">LeetCode username</Label>
        <InputGroup>
          <InputGroupAddon>
            <HugeiconsIcon icon={CodeSquareIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            id="leetcode-username"
            name="username"
            type="text"
            autoComplete="off"
            placeholder="Your LeetCode handle"
            aria-invalid={Boolean(error)}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </InputGroup>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-muted/20">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 font-mono text-[0.65rem] font-medium tracking-[0.12em] text-foreground uppercase">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            className="size-3.5 text-gold"
          />
          Where to find your username
        </div>
        <div className="space-y-2.5 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            Open your public LeetCode profile and copy the text after{" "}
            <span className="font-mono text-foreground">/u/</span> in the address bar.
          </p>
          <div className="rounded-sm border border-border bg-background px-2.5 py-2 font-mono text-[0.68rem] text-foreground">
            leetcode.com/u/<span className="text-gold">your-username</span>/
          </div>
          <p>
            Don&apos;t use the <strong className="font-medium text-foreground">Display Name</strong>{" "}
            shown in Settings—it can be different.
          </p>
          <a
            href="https://leetcode.com/profile/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-gold decoration-2 underline-offset-4"
          >
            Open my LeetCode profile
            <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-3.5" />
          </a>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? <Spinner /> : "Generate verification code"}
      </Button>
    </form>
  );
}
