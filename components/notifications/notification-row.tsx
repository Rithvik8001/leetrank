"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import { LedgerRow } from "@/components/standings";
import { glyphFor } from "@/components/notifications/glyphs";
import { markNotificationRead } from "@/app/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";

export function NotificationRow({ item }: { item: NotificationItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const glyph = glyphFor(item.type);
  const unread = item.readAt == null;

  function handleActivate() {
    startTransition(async () => {
      if (unread) await markNotificationRead(item.id);
      if (item.href) router.push(item.href);
      else router.refresh();
    });
  }

  return (
    <LedgerRow leader={unread}>
      <span
        aria-hidden="true"
        className={cn(
          "w-4 text-center font-mono text-sm leading-none",
          glyph.brass ? "text-gold" : "text-muted-foreground",
        )}
      >
        {glyph.symbol}
      </span>
      <button
        type="button"
        onClick={handleActivate}
        disabled={isPending}
        className="min-w-0 text-left"
      >
        <p
          className={cn(
            "truncate text-sm",
            unread ? "font-medium text-foreground" : "text-foreground/90",
          )}
        >
          {item.title}
        </p>
        {item.body ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {item.body}
          </p>
        ) : null}
      </button>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {formatRelativeTime(item.createdAt)}
      </span>
    </LedgerRow>
  );
}
