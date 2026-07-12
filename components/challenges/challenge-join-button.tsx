"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { joinChallenge, leaveChallenge } from "@/app/groups/challenges/actions";
import { Button } from "@/components/ui/button";

export function ChallengeJoinButton({
  groupId,
  challengeId,
  joined,
  status,
}: {
  groupId: string;
  challengeId: string;
  joined: boolean;
  status: "upcoming" | "active" | "ended";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleJoin() {
    startTransition(async () => {
      const result = await joinChallenge(groupId, challengeId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("You're in.");
      router.refresh();
    });
  }

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveChallenge(groupId, challengeId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("You left the challenge.");
      router.refresh();
    });
  }

  if (status === "ended") {
    return <Button disabled>Challenge ended</Button>;
  }
  if (joined && status === "upcoming") {
    return (
      <Button variant="outline" onClick={handleLeave} disabled={isPending}>
        {isPending ? "Leaving…" : "Leave challenge"}
      </Button>
    );
  }
  if (joined) {
    return <Button disabled>Joined</Button>;
  }
  return (
    <Button onClick={handleJoin} disabled={isPending}>
      {isPending ? "Joining…" : "Join challenge"}
    </Button>
  );
}
