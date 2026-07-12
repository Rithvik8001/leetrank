"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { createGroupChallenge } from "@/app/groups/challenges/actions";
import { challengeFormSchema, type ChallengeFormValues } from "@/lib/challenges/schemas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChallengeFormFields } from "@/components/challenges/challenge-form-fields";

function addUtcDays(days: number) {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
  return date.toISOString().slice(0, 10);
}

const initialValues: ChallengeFormValues = {
  title: "",
  description: "",
  metric: "TOTAL_SOLVED",
  startsOn: addUtcDays(0),
  endsOn: addUtcDays(29),
};

export function CreateChallengeForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ChallengeFormValues>(initialValues);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = challengeFormSchema.safeParse(values);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the challenge details.");
      return;
    }

    startTransition(async () => {
      const result = await createGroupChallenge(groupId, values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Challenge created.");
      setOpen(false);
      setValues(initialValues);
      router.push(`/groups/${groupId}/challenges/${result.data.id}`);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
        New challenge
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create challenge</DialogTitle>
          <DialogDescription>
            Start a private season for verified members of this group.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <ChallengeFormFields values={values} onChange={setValues} disabled={isPending} />
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Creating…" : "Create challenge"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
