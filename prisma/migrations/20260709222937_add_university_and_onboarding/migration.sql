-- CreateEnum
CREATE TYPE "ownership_type" AS ENUM ('PUBLIC', 'PRIVATE_NONPROFIT', 'PRIVATE_FOR_PROFIT');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "leetcodeEasySolved" INTEGER,
ADD COLUMN     "leetcodeHardSolved" INTEGER,
ADD COLUMN     "leetcodeLastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "leetcodeMediumSolved" INTEGER,
ADD COLUMN     "leetcodeRanking" INTEGER,
ADD COLUMN     "leetcodeTotalSolved" INTEGER,
ADD COLUMN     "leetcodeUsername" TEXT,
ADD COLUMN     "leetcodeVerificationCode" TEXT,
ADD COLUMN     "leetcodeVerificationCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "leetcodeVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leetcodeVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "universityId" TEXT;

-- CreateTable
CREATE TABLE "university" (
    "id" TEXT NOT NULL,
    "unitId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "website" TEXT,
    "ownershipType" "ownership_type",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "university_state_idx" ON "university"("state");

-- CreateIndex
CREATE INDEX "university_name_idx" ON "university"("name");

-- CreateIndex
CREATE UNIQUE INDEX "university_slug_key" ON "university"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "university_unitId_key" ON "university"("unitId");

-- CreateIndex
CREATE INDEX "user_universityId_idx" ON "user"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "user_leetcodeUsername_key" ON "user"("leetcodeUsername");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university"("id") ON DELETE SET NULL ON UPDATE CASCADE;

