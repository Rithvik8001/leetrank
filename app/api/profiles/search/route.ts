import { auth } from "@/lib/auth";
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
    const results = await searchComparableProfiles(query, !session);
    return Response.json({ results }, { headers: RESPONSE_HEADERS });
  } catch {
    return Response.json(
      { error: "Profile search is unavailable right now." },
      { status: 500, headers: RESPONSE_HEADERS },
    );
  }
}
