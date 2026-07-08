import { createAuthClient } from "better-auth/client";

const BASE_URL = process.env.BETTER_AUTH_URL as string;

if (!BASE_URL) {
  throw new Error("Missing required environment variable: BETTER_AUTH_URL");
}

export const authClient = createAuthClient({
  baseURL: BASE_URL,
});
