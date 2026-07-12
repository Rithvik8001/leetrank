"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { glyphFor } from "@/components/notifications/glyphs";
import { markNotificationRead } from "@/app/notifications/actions";
import type { NotificationItem } from "@/lib/notifications/queries";

export function NotificationBell({
  count,
  items,
}: {
  count: number;
  items: NotificationItem[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function openNotification(item: NotificationItem) {
    startTransition(async () => {
      if (item.readAt == null) await markNotificationRead(item.id);
      if (item.href) router.push(item.href);
      else router.refresh();
    });
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={
          count > 0 ? `Notifications, ${count} unread` : "Notifications"
        }
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <HugeiconsIcon icon={Notification03Icon} strokeWidth={2} className="size-5" />
        {count > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-gold px-1 font-mono text-[0.6rem] leading-4 font-medium text-gold-foreground tabular-nums">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-80 gap-0 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="font-mono text-[0.7rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Notifications
          </span>
          {count > 0 ? (
            <span className="font-mono text-[0.7rem] text-gold tabular-nums">
              {count} new
            </span>
          ) : null}
        </div>

        {items.length ? (
          <div className="flex max-h-96 flex-col divide-y divide-border overflow-y-auto">
            {items.map((item) => {
              const glyph = glyphFor(item.type);
              const unread = item.readAt == null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openNotification(item)}
                  className={cn(
                    "flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
                    unread && "bg-muted/30",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 w-4 shrink-0 text-center font-mono text-sm leading-none",
                      glyph.brass ? "text-gold" : "text-muted-foreground",
                    )}
                  >
                    {glyph.symbol}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        unread ? "font-medium text-foreground" : "text-foreground/90",
                      )}
                    >
                      {item.title}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.68rem] text-muted-foreground tabular-nums">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
            You&apos;re all caught up.
          </div>
        )}

        <div className="border-t border-border px-3 py-2">
          <Link
            href="/notifications"
            className="block text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
