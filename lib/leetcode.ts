const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

const PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        aboutMe
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

export type LeetCodePublicProfile = {
  username: string;
  aboutMe: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
};

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

type AcSubmissionEntry = {
  difficulty: "All" | "Easy" | "Medium" | "Hard";
  count: number;
};

type MatchedUser = {
  username: string;
  profile: {
    ranking: number | null;
    aboutMe: string;
  };
  submitStatsGlobal: {
    acSubmissionNum: AcSubmissionEntry[];
  };
};

export async function fetchLeetCodePublicProfile(
  username: string,
): Promise<LeetCodePublicProfile> {
  let response: Response;
  try {
    response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/${username}/`,
        "User-Agent":
          "Mozilla/5.0 (compatible; LeetRankBot/1.0; +https://leetrank.app)",
      },
      body: JSON.stringify({
        query: PROFILE_QUERY,
        variables: { username },
      }),
    });
  } catch (error) {
    throw new LeetCodeFetchError(
      `Network error while contacting LeetCode: ${(error as Error).message}`,
    );
  }

  if (response.status === 429) {
    throw new LeetCodeRateLimitedError();
  }

  if (!response.ok) {
    throw new LeetCodeFetchError(
      `LeetCode responded with status ${response.status}.`,
    );
  }

  let json: { data?: { matchedUser: MatchedUser | null } };
  try {
    json = await response.json();
  } catch {
    // LeetCode's anti-bot layer sometimes returns an HTML captcha challenge
    // page instead of JSON on a 200 response — this is where that surfaces.
    throw new LeetCodeFetchError(
      "LeetCode returned a non-JSON response (possibly rate-limited or challenged).",
    );
  }

  const matchedUser = json.data?.matchedUser;
  if (!matchedUser) {
    throw new LeetCodeProfileNotFoundError(username);
  }

  const counts = Object.fromEntries(
    matchedUser.submitStatsGlobal.acSubmissionNum.map((entry) => [
      entry.difficulty,
      entry.count,
    ]),
  );

  return {
    username: matchedUser.username,
    aboutMe: matchedUser.profile.aboutMe ?? "",
    ranking: matchedUser.profile.ranking ?? null,
    totalSolved: counts.All ?? 0,
    easySolved: counts.Easy ?? 0,
    mediumSolved: counts.Medium ?? 0,
    hardSolved: counts.Hard ?? 0,
  };
}

export function bioContainsCode(aboutMe: string, code: string): boolean {
  return aboutMe.includes(code);
}
