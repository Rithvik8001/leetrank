"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function RouteError({ error, reset, unstable_retry }: { error: Error & { digest?: string }; reset: () => void; unstable_retry?: () => void }) {
  useEffect(() => { console.error("Route rendering failed", { digest: error.digest }); }, [error]);
  return <div className="px-6 py-12">
    <Empty className="min-h-72 rounded-md border border-border">
      <EmptyHeader><EmptyTitle>Something went wrong</EmptyTitle><EmptyDescription>This page could not be loaded. Try the request again.</EmptyDescription></EmptyHeader>
      <EmptyContent><Button onClick={() => (unstable_retry ?? reset)()}>Try again</Button>{error.digest ? <p className="font-mono text-[0.62rem] text-muted-foreground">Reference {error.digest}</p> : null}</EmptyContent>
    </Empty>
  </div>;
}

