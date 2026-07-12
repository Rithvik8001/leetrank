-- CreateTable
CREATE TABLE "leetcode_snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSolved" INTEGER NOT NULL,
    "easySolved" INTEGER NOT NULL,
    "mediumSolved" INTEGER NOT NULL,
    "hardSolved" INTEGER NOT NULL,
    "contestRating" DOUBLE PRECISION,
    "ranking" INTEGER,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedOn" DATE NOT NULL,

    CONSTRAINT "leetcode_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leetcode_snapshot_userId_capturedAt_idx" ON "leetcode_snapshot"("userId", "capturedAt");

-- CreateIndex
CREATE UNIQUE INDEX "leetcode_snapshot_userId_capturedOn_key" ON "leetcode_snapshot"("userId", "capturedOn");

-- AddForeignKey
ALTER TABLE "leetcode_snapshot" ADD CONSTRAINT "leetcode_snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
