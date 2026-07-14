-- CreateEnum
CREATE TYPE "sync_run_status" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "sync_run_item_status" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'SKIPPED', 'FAILED');

-- AlterTable
ALTER TABLE "notification" ADD COLUMN "eventKey" TEXT;

-- CreateTable
CREATE TABLE "sync_run" (
    "id" TEXT NOT NULL,
    "scheduledFor" DATE NOT NULL,
    "status" "sync_run_status" NOT NULL DEFAULT 'QUEUED',
    "startedAt" TIMESTAMP(3),
    "heartbeatAt" TIMESTAMP(3),
    "challengeFinalizedAt" TIMESTAMP(3),
    "challengeNotificationsAt" TIMESTAMP(3),
    "terminalStageAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "lastError" TEXT,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_run_item" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "sync_run_item_status" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" TEXT,
    "leasedAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "lastError" TEXT,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sync_run_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_recipientId_eventKey_key" ON "notification"("recipientId", "eventKey");
CREATE UNIQUE INDEX "sync_run_scheduledFor_key" ON "sync_run"("scheduledFor");
CREATE INDEX "sync_run_status_scheduledFor_idx" ON "sync_run"("status", "scheduledFor");
CREATE UNIQUE INDEX "sync_run_item_runId_userId_key" ON "sync_run_item"("runId", "userId");
CREATE INDEX "sync_run_item_runId_status_idx" ON "sync_run_item"("runId", "status");
CREATE INDEX "sync_run_item_status_leasedAt_idx" ON "sync_run_item"("status", "leasedAt");
CREATE INDEX "sync_run_item_userId_idx" ON "sync_run_item"("userId");

-- AddForeignKey
ALTER TABLE "sync_run_item" ADD CONSTRAINT "sync_run_item_runId_fkey" FOREIGN KEY ("runId") REFERENCES "sync_run"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sync_run_item" ADD CONSTRAINT "sync_run_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
