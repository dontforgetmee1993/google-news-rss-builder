import { z } from "zod";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Base object schema — used to derive updateFeedSchema before .refine() wraps it in ZodEffects
const feedBaseSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(3).max(100).regex(slugRegex, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(1000).optional(),
  keywords: z.array(z.string().max(100)).max(20).default([]),
  exact_phrases: z.array(z.string().max(200)).max(10).default([]),
  excluded_keywords: z.array(z.string().max(100)).max(20).default([]),
  or_keywords: z.array(z.string().max(100)).max(20).default([]),
  domains: z.array(z.string().max(253)).max(10).default([]),
  country: z.string().min(2).max(5).default("US"),
  language: z.string().min(2).max(10).default("en-US"),
  ceid: z.string().min(3).max(20).default("US:en"),
  time_range: z.enum(["1d", "7d", "1m", "1y"]).optional(),
  date_after: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  date_before: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_public: z.boolean().default(false),
});

// createFeedSchema adds the "at least one search term" refinement
export const createFeedSchema = feedBaseSchema.refine(
  (data) => data.keywords.length > 0 || data.domains.length > 0 || data.exact_phrases.length > 0 || data.or_keywords.length > 0,
  { message: "At least one keyword, phrase, or domain is required" }
);

// updateFeedSchema is derived from the base (before ZodEffects) so .partial() is available
export const updateFeedSchema = feedBaseSchema.partial().omit({ slug: true }).extend({
  slug: z.string().min(3).max(100).regex(slugRegex).optional(),
});

export const buildUrlSchema = z.object({
  keywords: z.array(z.string()).default([]),
  exact_phrases: z.array(z.string()).default([]),
  excluded_keywords: z.array(z.string()).default([]),
  or_keywords: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
  country: z.string().default("US"),
  language: z.string().default("en-US"),
  ceid: z.string().default("US:en"),
  time_range: z.string().optional(),
  date_after: z.string().optional(),
  date_before: z.string().optional(),
});

export type CreateFeedInput = z.infer<typeof createFeedSchema>;
export type UpdateFeedInput = z.infer<typeof updateFeedSchema>;
export type BuildUrlInput = z.infer<typeof buildUrlSchema>;
