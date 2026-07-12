"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import {
  deleteGroupChallenge,
  updateGroupChallenge,
} from "@/app/groups/challenges/actions";
import { challengeFormSchema, type ChallengeFormValues } from "@/lib/challenges/schemas";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChallengeFormFields } from "@/components/challenges/challenge-form-fields";

export function ChallengeOwnerControls({
  groupId,
  challengeId,
  initialValues,
}: {
  groupId: string;
  challengeId: string;
  initialValues: ChallengeFormValues;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [values, setValues] = useState<ChallengeFormValues>(initialValues);
  const [isPending, startTransition] = useTransition();

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const parsed = challengeFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the challenge details.");
      return;
    }
    startTransition(async () => {
      const result = await updateGroupChallenge(groupId, challengeId, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Challenge updated.");
      setEditOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteGroupChallenge(groupId, challengeId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Challenge deleted.");
      router.push(`/groups/${groupId}/challenges`);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          Edit
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit challenge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4" noValidate>
            <ChallengeFormFields values={values} onChange={setValues} disabled={isPending} />
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
            <AlertDialogTitle>Delete this challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the challenge and its participant standings. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
              Delete challenge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
