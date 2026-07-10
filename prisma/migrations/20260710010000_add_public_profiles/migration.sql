-- AlterTable
ALTER TABLE "user"
ADD COLUMN "publicProfileEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publicProfileHandle" TEXT;

-- Backfill stable handles for existing verified accounts.
UPDATE "user"
SET "publicProfileHandle" = LOWER("leetcodeUsername")
WHERE "leetcodeVerified" = true AND "leetcodeUsername" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_publicProfileHandle_key" ON "user"("publicProfileHandle");
