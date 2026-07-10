-- CreateEnum
CREATE TYPE "leetcode_sync_status" AS ENUM ('IDLE', 'PENDING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "user"
ADD COLUMN "leetcodeContestRating" DOUBLE PRECISION,
ADD COLUMN "leetcodeContestGlobalRanking" INTEGER,
ADD COLUMN "leetcodeBadges" JSONB,
ADD COLUMN "leetcodeSyncStatus" "leetcode_sync_status" NOT NULL DEFAULT 'IDLE',
ADD COLUMN "leetcodeSyncError" TEXT,
ADD COLUMN "leetcodeLastSyncAttemptAt" TIMESTAMP(3);
