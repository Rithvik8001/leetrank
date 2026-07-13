import { auth } from "@/lib/auth";
import {
  consumeRateLimit,
  getClientIp,
  PROFILE_SEARCH,
} from "@/lib/rate-limit";
import {
  normalizeProfileSearchQuery,
  PROFILE_SEARCH_MIN_LENGTH,
  searchComparableProfiles,
} from "@/lib/users/profiles";

const RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
} as const;

export async function GET(request: Request) {
  const query = normalizeProfileSearchQuery(
    new URL(request.url).searchParams.get("q") ?? "",
  );
  if (query.length < PROFILE_SEARCH_MIN_LENGTH) {
    return Response.json({ results: [] }, { headers: RESPONSE_HEADERS });
  }

  try {
    const session = await auth.api.getSession({ headers: request.headers });

    const identity = session?.user.id ?? getClientIp(request.headers);
    const limit = await consumeRateLimit(`search:${identity}`, PROFILE_SEARCH);
    if (!limit.allowed) {
      return Response.json(
        { error: "Too many searches. Slow down and try again shortly." },
        {
          status: 429,
          headers: {
            ...RESPONSE_HEADERS,
            "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
          },
        },
      );
    }

    const results = await searchComparableProfiles(query, !session);
    return Response.json({ results }, { headers: RESPONSE_HEADERS });
  } catch {
    return Response.json(
      { error: "Profile search is unavailable right now." },
      { status: 500, headers: RESPONSE_HEADERS },
    );
  }
}
