-- Backfill a day-0 snapshot for users verified before snapshot persistence existed.
INSERT INTO "leetcode_snapshot"
  ("id", "userId", "totalSolved", "easySolved", "mediumSolved", "hardSolved",
   "contestRating", "ranking", "capturedAt", "capturedOn")
SELECT gen_random_uuid(), "id",
       COALESCE("leetcodeTotalSolved", 0), COALESCE("leetcodeEasySolved", 0),
       COALESCE("leetcodeMediumSolved", 0), COALESCE("leetcodeHardSolved", 0),
       "leetcodeContestRating", "leetcodeRanking",
       NOW(), (NOW() AT TIME ZONE 'UTC')::date
FROM "user"
WHERE "leetcodeVerified" = true AND "leetcodeTotalSolved" IS NOT NULL
ON CONFLICT ("userId", "capturedOn") DO NOTHING;
