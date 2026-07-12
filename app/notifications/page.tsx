import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/notifications/queries";
import { SectionLabel } from "@/components/marketing/section-label";
import { Ledger } from "@/components/standings";
import { NotificationRow } from "@/components/notifications/notification-row";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function NotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  const hasUnread = notifications.some((n) => n.readAt == null);

  return (
    <div className="flex flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-4">
        <SectionLabel>Activity inbox</SectionLabel>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold tracking-[-0.03em] text-balance sm:text-5xl">
              Notifications
            </h1>
            <p className="mt-3 max-w-xl text-pretty text-sm text-muted-foreground">
              Everything that happened across your clubs, groups, and challenges.
            </p>
          </div>
          {hasUnread ? <MarkAllReadButton /> : null}
        </div>
      </header>

      {notifications.length ? (
        <Ledger>
          {notifications.map((item) => (
            <NotificationRow key={item.id} item={item} />
          ))}
        </Ledger>
      ) : (
        <Empty className="rounded-md border border-border">
          <EmptyHeader>
            <EmptyTitle>No notifications yet</EmptyTitle>
            <EmptyDescription>
              When your clubs post announcements, challenges start, or your role
              changes, you&apos;ll see it here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
