import { syncAllVerifiedUsers } from "@/lib/leetcode-sync";
import { finalizeEndedChallenges } from "@/lib/challenges/finalize";
import { generateChallengeNotifications } from "@/lib/notifications/challenges";

// The proxy matcher excludes /api, so this route guards itself. Vercel Cron
// invokes it with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sync = await syncAllVerifiedUsers();
  const finalizedChallenges = await finalizeEndedChallenges();
  const challengeNotifications = await generateChallengeNotifications();
  return Response.json({ sync, finalizedChallenges, challengeNotifications });
}

export const dynamic = "force-dynamic";
export const maxDuration = 300;
