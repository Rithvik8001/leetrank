import { processSyncTick } from "@/lib/sync-runs";
import { logEvent } from "@/lib/observability";

// The proxy matcher excludes /api, so this route guards itself. Vercel Cron
// invokes it with `Authorization: Bearer $CRON_SECRET`.
export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authorization !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    logEvent("warn", "cron.unauthorized", { path: "/api/cron/snapshots" });
    return new Response("Unauthorized", { status: 401 });
  }

  return Response.json(await processSyncTick());
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;
