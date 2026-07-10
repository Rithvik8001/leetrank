"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout03Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  function logout() {
    authClient.signOut({
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onResponse: () => setIsPending(false),
        onSuccess: () => {
          router.replace("/login");
          router.refresh();
        },
        onError: (context) => {
          toast.error(context.error.message ?? "Couldn't log you out. Try again.");
        },
      },
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={logout}
      disabled={isPending}
      aria-label={isPending ? "Logging out" : "Log out"}
    >
      {isPending ? <Spinner /> : <HugeiconsIcon icon={Logout03Icon} strokeWidth={2} />}
      <span className="hidden sm:inline">{isPending ? "Logging out" : "Log out"}</span>
    </Button>
  );
}
