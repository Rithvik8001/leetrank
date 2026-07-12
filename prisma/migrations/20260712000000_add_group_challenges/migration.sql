-- CreateEnum
CREATE TYPE "challenge_metric" AS ENUM ('TOTAL_SOLVED', 'HARD_SOLVED', 'CONTEST_RATING');

-- CreateEnum
CREATE TYPE "challenge_baseline_kind" AS ENUM ('START_SNAPSHOT', 'JOIN_FALLBACK', 'PENDING');

-- CreateTable
CREATE TABLE "group_challenge" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metric" "challenge_metric" NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "group_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participant" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "baselineKind" "challenge_baseline_kind" NOT NULL DEFAULT 'PENDING',
    "baselineTotalSolved" INTEGER,
    "baselineHardSolved" INTEGER,
    "baselineContestRating" DOUBLE PRECISION,
    "baselineCapturedAt" TIMESTAMP(3),
    "finalMetricValue" DOUBLE PRECISION,
    "finalDelta" DOUBLE PRECISION,
    "finalizedAt" TIMESTAMP(3),

    CONSTRAINT "challenge_participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_challenge_groupId_startsOn_idx" ON "group_challenge"("groupId", "startsOn");

-- CreateIndex
CREATE INDEX "group_challenge_groupId_endsOn_idx" ON "group_challenge"("groupId", "endsOn");

-- CreateIndex
CREATE INDEX "challenge_participant_userId_idx" ON "challenge_participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participant_challengeId_userId_key" ON "challenge_participant"("challengeId", "userId");

-- AddForeignKey
ALTER TABLE "group_challenge" ADD CONSTRAINT "group_challenge_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_challenge" ADD CONSTRAINT "group_challenge_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "group_challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participant" ADD CONSTRAINT "challenge_participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
