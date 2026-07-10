"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { joinGroup } from "@/app/groups/actions";
import { Button } from "@/components/ui/button";

export function JoinGroupButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    startTransition(async () => {
      const result = await joinGroup(token);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("You joined the group.");
      router.push(`/groups/${result.data.id}`);
    });
  }

  return (
    <Button type="button" onClick={handleJoin} disabled={isPending}>
      {isPending ? "Joining…" : "Join group"}
    </Button>
  );
}
