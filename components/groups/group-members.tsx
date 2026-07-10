"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { leaveGroup, removeMember } from "@/app/groups/actions";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  name: string;
  leetcodeUsername: string | null;
  isOwner: boolean;
};

export function GroupMembers({
  groupId,
  members,
  viewerId,
  viewerIsOwner,
}: {
  groupId: string;
  members: Member[];
  viewerId: string;
  viewerIsOwner: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRemove(userId: string) {
    startTransition(async () => {
      const result = await removeMember(groupId, userId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Member removed.");
      router.refresh();
    });
  }

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveGroup(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("You left the group.");
      router.push("/groups");
    });
  }

  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {member.name}
              {member.isOwner ? (
                <span className="ml-2 font-mono text-[0.6rem] tracking-[0.12em] text-gold uppercase">
                  Owner
                </span>
              ) : null}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              @{member.leetcodeUsername}
            </p>
          </div>
          {viewerIsOwner && !member.isOwner ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemove(member.id)}
              disabled={isPending}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Remove
            </Button>
          ) : !viewerIsOwner && member.id === viewerId ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLeave}
              disabled={isPending}
            >
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
              Leave
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
