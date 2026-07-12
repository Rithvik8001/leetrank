import { z } from "zod";

const httpsUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .refine((value) => value.startsWith("https://"), "Use an HTTPS URL");
const optionalHttpsUrl = z
  .union([z.literal(""), httpsUrl])
  .transform((value) => value || null);

export function normalizeClubSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const reservedSlugs = new Set([
  "admin",
  "api",
  "apply",
  "new",
  "groups",
  "universities",
]);

export const clubApplicationSchema = z.object({
  proposedName: z.string().trim().min(3).max(80),
  requestedSlug: z
    .string()
    .transform(normalizeClubSlug)
    .pipe(
      z
        .string()
        .min(3)
        .max(60)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    )
    .refine((slug) => !reservedSlugs.has(slug), "That club URL is reserved"),
  description: z.string().trim().min(30).max(600),
  officialWebsiteUrl: httpsUrl,
  facultyAdvisorName: z.string().trim().min(3).max(100),
  facultyAdvisorEmail: z.string().trim().email().max(200),
  contactEmail: z.string().trim().email().max(200),
  githubUrl: optionalHttpsUrl,
  discordUrl: optionalHttpsUrl,
  evidenceNote: z.string().trim().min(50).max(1000),
});

export const membershipApplicationSchema = z.object({
  message: z.string().trim().max(500).optional().default(""),
});
export const reviewSchema = z.object({
  note: z.string().trim().min(10).max(1000),
});
export const memberDecisionSchema = z.object({
  note: z.string().trim().max(500).optional().default(""),
});
export const memberRemovalSchema = z.object({
  reason: z.string().trim().min(5).max(500),
});
export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(100),
  body: z.string().trim().min(1).max(2000),
  visibility: z.enum(["PUBLIC", "MEMBERS"]),
});
export const clubProfileSchema = z.object({
  name: z.string().trim().min(3).max(80),
  description: z.string().trim().min(30).max(600),
  contactEmail: z.string().trim().email().max(200),
  websiteUrl: httpsUrl,
  githubUrl: optionalHttpsUrl,
  discordUrl: optionalHttpsUrl,
});

export type ClubApplicationValues = z.input<typeof clubApplicationSchema>;
export type AnnouncementValues = z.input<typeof announcementSchema>;
export type ClubProfileValues = z.input<typeof clubProfileSchema>;
