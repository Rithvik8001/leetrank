"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share01Icon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { setPublicProfileEnabled } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function PublicProfileControls({ enabled, handle }: { enabled: boolean; handle: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function setEnabled(next: boolean) {
    startTransition(async () => {
      const result = await setPublicProfileEnabled(next);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Public profile enabled." : "Public profile hidden.");
      router.refresh();
    });
  }

  if (!enabled) {
    return (
      <Button variant="outline" disabled={pending} onClick={() => setEnabled(true)}>
        {pending ? <Spinner /> : <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />}
        Make profile public
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button nativeButton={false} render={<Link href={`/u/${handle}`} />}>
        <HugeiconsIcon icon={Share01Icon} strokeWidth={2} />
        View public profile
      </Button>
      <Button variant="ghost" disabled={pending} onClick={() => setEnabled(false)}>
        {pending ? <Spinner /> : <HugeiconsIcon icon={ViewOffIcon} strokeWidth={2} />}
        Make private
      </Button>
    </div>
  );
}
