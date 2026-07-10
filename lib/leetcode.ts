const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking aboutMe }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      badges { id displayName icon creationDate }
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
    }
  }
`;

export type LeetCodeBadge = {
  id: string;
  name: string;
  iconUrl: string | null;
  earnedAt: string | null;
};

export type LeetCodePublicProfile = {
  username: string;
  aboutMe: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  contestRating: number | null;
  contestGlobalRanking: number | null;
  badges: LeetCodeBadge[];
};

export type LeetCodeFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export class LeetCodeProfileNotFoundError extends Error {
  constructor(username: string) {
    super(`No LeetCode profile found for username "${username}".`);
    this.name = "LeetCodeProfileNotFoundError";
  }
}

export class LeetCodeRateLimitedError extends Error {
  constructor() {
    super("LeetCode is rate-limiting requests. Try again shortly.");
    this.name = "LeetCodeRateLimitedError";
  }
}

export class LeetCodeFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeetCodeFetchError";
  }
}

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function finiteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function absoluteIconUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value) return null;
  if (value.startsWith("https://")) return value;
  if (value.startsWith("http://")) return `https://${value.slice(7)}`;
  return `https://leetcode.com${value.startsWith("/") ? "" : "/"}${value}`;
}

export function normalizeLeetCodeResponse(
  payload: unknown,
  requestedUsername: string,
): LeetCodePublicProfile {
  const root = record(payload);
  const data = record(root?.data);
  const matchedUser = record(data?.matchedUser);
  if (!matchedUser) throw new LeetCodeProfileNotFoundError(requestedUsername);

  const username = matchedUser.username;
  if (typeof username !== "string" || !username) {
    throw new LeetCodeFetchError("LeetCode returned an incomplete profile.");
  }

  const profile = record(matchedUser.profile);
  const submitStats = record(matchedUser.submitStatsGlobal);
  const entries = Array.isArray(submitStats?.acSubmissionNum)
    ? submitStats.acSubmissionNum
    : [];
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const item = record(entry);
    const count = finiteNumber(item?.count);
    if (typeof item?.difficulty === "string" && count !== null) {
      counts.set(item.difficulty, count);
    }
  }

  const badges: LeetCodeBadge[] = [];
  if (Array.isArray(matchedUser.badges)) {
    for (const badge of matchedUser.badges) {
      const item = record(badge);
      if (!item) continue;
      const name =
        typeof item.displayName === "string" ? item.displayName : null;
      if (!name) continue;
      badges.push({
        id: String(item.id ?? name),
        name,
        iconUrl: absoluteIconUrl(item.icon),
        earnedAt:
          typeof item.creationDate === "string" ? item.creationDate : null,
      });
    }
  }

  const contest = record(data?.userContestRanking);
  return {
    username,
    aboutMe: typeof profile?.aboutMe === "string" ? profile.aboutMe : "",
    ranking: finiteNumber(profile?.ranking),
    totalSolved: counts.get("All") ?? 0,
    easySolved: counts.get("Easy") ?? 0,
    mediumSolved: counts.get("Medium") ?? 0,
    hardSolved: counts.get("Hard") ?? 0,
    contestRating: finiteNumber(contest?.rating),
    contestGlobalRanking: finiteNumber(contest?.globalRanking),
    badges,
  };
}

export async function fetchLeetCodePublicProfile(
  username: string,
  fetcher: LeetCodeFetcher = fetch,
): Promise<LeetCodePublicProfile> {
  let response: Response;
  try {
    response = await fetcher(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/${username}/`,
        "User-Agent":
          "Mozilla/5.0 (compatible; LeetRankBot/1.0; +https://leetrank.app)",
      },
      body: JSON.stringify({ query: PROFILE_QUERY, variables: { username } }),
      cache: "no-store",
    });
  } catch {
    throw new LeetCodeFetchError(
      "We couldn't reach LeetCode. Try again shortly.",
    );
  }

  if (response.status === 429) throw new LeetCodeRateLimitedError();
  if (!response.ok) {
    throw new LeetCodeFetchError(
      "LeetCode is unavailable right now. Try again shortly.",
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new LeetCodeFetchError(
      "LeetCode returned an unexpected response. Try again shortly.",
    );
  }
  return normalizeLeetCodeResponse(json, username);
}

export function bioContainsCode(aboutMe: string, code: string): boolean {
  return aboutMe.includes(code);
}
