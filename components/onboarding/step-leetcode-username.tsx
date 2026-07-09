"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CodeSquareIcon } from "@hugeicons/core-free-icons";
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

      <Button type="submit" size="lg" className="mt-2 w-full" disabled={isPending}>
        {isPending ? <Spinner /> : "Generate verification code"}
      </Button>
    </form>
  );
}
