-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('CLUB_APPLICATION_APPROVED', 'CLUB_APPLICATION_REJECTED', 'CLUB_APPLICATION_CHANGES_REQUESTED', 'CLUB_MEMBERSHIP_APPROVED', 'CLUB_MEMBERSHIP_REJECTED', 'CLUB_ANNOUNCEMENT_PUBLISHED', 'CLUB_ROLE_CHANGED', 'CLUB_MEMBER_REMOVED', 'GROUP_MEMBER_JOINED', 'GROUP_MEMBER_REMOVED', 'CHALLENGE_CREATED', 'CHALLENGE_STARTED', 'CHALLENGE_ENDING_SOON', 'CHALLENGE_FINISHED');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "notification_type" NOT NULL,
    "groupId" TEXT,
    "challengeId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "href" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_recipientId_createdAt_idx" ON "notification"("recipientId", "createdAt");

-- CreateIndex
CREATE INDEX "notification_recipientId_readAt_idx" ON "notification"("recipientId", "readAt");

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
