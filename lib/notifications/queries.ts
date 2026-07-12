import { prisma } from "@/lib/prisma";

export const NOTIFICATION_LIMIT = 50; // inbox page
export const NOTIFICATION_PREVIEW_LIMIT = 6; // bell popover

export type NotificationActor = {
  name: string;
  profileHref: string | null;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  createdAt: Date;
  readAt: Date | null;
  actor: NotificationActor | null;
};

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { recipientId: userId, readAt: null },
  });
}

export async function getNotifications(
  userId: string,
  limit = NOTIFICATION_LIMIT,
): Promise<NotificationItem[]> {
  const rows = await prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      title: true,
      body: true,
      href: true,
      createdAt: true,
      readAt: true,
      actor: {
        select: {
          name: true,
          publicProfileEnabled: true,
          publicProfileHandle: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.createdAt,
    readAt: row.readAt,
    actor: row.actor
      ? {
          name: row.actor.name,
          profileHref:
            row.actor.publicProfileEnabled && row.actor.publicProfileHandle
              ? `/u/${row.actor.publicProfileHandle}`
              : null,
        }
      : null,
  }));
}
