import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const activityMethodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const expertListItemSchema = z.object({
  id: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
  introduction: z.string(),
  activityMethod: activityMethodSchema,
  averageRating: z.number().nullable().optional(),
  reviewCount: z.number().optional(),
  subCategories: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional(),
  availableRegions: z.array(z.string()).optional(),
})

export const expertDetailSchema = expertListItemSchema.extend({
  detailIntroduction: z.string().optional(),
  careerPeriod: z.string().optional(),
  availableTimes: z
    .array(z.object({ dayOfWeek: z.string(), timeSlot: z.string() }))
    .optional(),
  certifications: z
    .array(z.object({ id: z.number().optional(), name: z.string(), issuer: z.string() }))
    .optional(),
  portfolios: z
    .array(
      z.object({
        id: z.number().optional(),
        type: z.string(),
        imageUrls: z.array(z.string()),
        description: z.string(),
      }),
    )
    .optional(),
})

export type ExpertListItem = z.infer<typeof expertListItemSchema>
export type ExpertDetail = z.infer<typeof expertDetailSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const expertListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(expertListItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const expertDetailResponseSchema = successResponseSchema(expertDetailSchema)
