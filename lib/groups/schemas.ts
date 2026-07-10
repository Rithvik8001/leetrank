import { z } from "zod";

export const GROUP_NAME_MIN = 2;
export const GROUP_NAME_MAX = 40;

export const groupNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(GROUP_NAME_MIN, "Give your group a name (at least 2 characters)")
    .max(GROUP_NAME_MAX, "Group names are at most 40 characters"),
});

export type GroupNameValues = z.infer<typeof groupNameSchema>;
