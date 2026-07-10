"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { deleteGroup, renameGroup } from "@/app/groups/actions";
import { groupNameSchema } from "@/lib/groups/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function GroupOwnerControls({
  groupId,
  currentName,
}: {
  groupId: string;
  currentName: string;
}) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(currentName);
  const [isPending, startTransition] = useTransition();

  function handleRename(event: React.FormEvent) {
    event.preventDefault();
    const parsed = groupNameSchema.safeParse({ name });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the group name.");
      return;
    }
    startTransition(async () => {
      const result = await renameGroup(groupId, parsed.data.name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Group renamed.");
      setRenameOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteGroup(groupId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Group deleted.");
      router.push("/groups");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          Rename
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename group</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRename} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="rename-group">Group name</Label>
              <Input
                id="rename-group"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                autoFocus
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Saving…" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="ghost" size="sm" />}>
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          Delete
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this group?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the group and its leaderboard for everyone. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
              Delete group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
