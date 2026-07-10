"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { createGroup } from "@/app/groups/actions";
import { groupNameSchema } from "@/lib/groups/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateGroupForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = groupNameSchema.safeParse({ name });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the group name.");
      return;
    }
    startTransition(async () => {
      const result = await createGroup(parsed.data.name);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Group created.");
      setOpen(false);
      setName("");
      router.push(`/groups/${result.data.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        New group
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>
            Start a private leaderboard and invite friends with a link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Dorm 4B grinders"
              maxLength={40}
              autoFocus
              disabled={isPending}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating…" : "Create group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
