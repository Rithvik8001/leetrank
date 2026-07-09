import { z } from "zod";

export const selectUniversitySchema = z.object({
  universityId: z.string().min(1, "Choose a university"),
});

export type SelectUniversityValues = z.infer<typeof selectUniversitySchema>;

export const leetcodeUsernameSchema = z.object({
  username: z
    .string()
    .min(1, "LeetCode username is required")
    .max(24, "That doesn't look like a valid LeetCode username")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "LeetCode usernames only contain letters, numbers, underscores, and hyphens",
    ),
});

export type LeetcodeUsernameValues = z.infer<typeof leetcodeUsernameSchema>;
