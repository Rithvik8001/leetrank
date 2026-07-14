import Link from "next/link";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import {
  getNotifications,
  getUnreadCount,
  NOTIFICATION_PREVIEW_LIMIT,
} from "@/lib/notifications/queries";

type NavLink = { href: string; label: string };

// Shared authenticated header (Wordmark · nav · notification bell · logout).
// Fetches the viewer's unread count + preview itself, so the bell logic lives in
// one place. On public pages (e.g. /clubs) an anonymous viewer sees a Log in /
// Sign up affordance instead of the app nav + bell + logout.
export async function AuthHeader({ links }: { links: NavLink[] }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur-xl">
        <Link href="/" aria-label="LeetRank home">
          <Wordmark />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Button nativeButton={false} render={<Link href="/signup" />}>
            Sign up
          </Button>
        </div>
      </header>
    );
  }

  const [count, preview] = await Promise.all([
    getUnreadCount(session.user.id),
    getNotifications(session.user.id, NOTIFICATION_PREVIEW_LIMIT),
  ]);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/70 px-6 backdrop-blur-xl">
      <Link href="/" aria-label="LeetRank home">
        <Wordmark />
      </Link>
      <div className="flex items-center gap-5">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
        <Link href="/settings/security" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Security
        </Link>
        <NotificationBell count={count} items={preview} />
        <LogoutButton />
      </div>
    </header>
  );
}
