import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const activityMethodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])
export const expertGradeSchema = z.enum(["EARLY_BIRD", "STANDARD", "PREMIUM"])
export const expertSortBySchema = z.enum(["RATING_DESC", "MATCH_COUNT_DESC", "LATEST"])
export type ExpertSortBy = z.infer<typeof expertSortBySchema>

// ─── ExpertSummaryResponse (리스트 + 인기 전문가 공용) ────────────────────────

export const expertSummarySchema = z.object({
  expertProfileId: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().nullable(),
  introduction: z.string(),
  activityMethod: activityMethodSchema,
  grade: expertGradeSchema,
  careerPeriod: z.string(),
  categoryNames: z.array(z.string()),
  regions: z.array(z.string()),
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  matchCount: z.number(),
})

export type ExpertSummary = z.infer<typeof expertSummarySchema>

/** @deprecated expertSummarySchema 사용 권장. 하위 호환을 위해 유지 */
export const expertListItemSchema = expertSummarySchema
/** @deprecated ExpertSummary 사용 권장 */
export type ExpertListItem = ExpertSummary

/** @deprecated ExpertSummary 사용 권장. 인기 전문가도 같은 응답 구조 */
export const popularExpertItemSchema = expertSummarySchema
/** @deprecated ExpertSummary 사용 권장 */
export type PopularExpertItem = ExpertSummary

// ─── ExpertDetail ────────────────────────────────────────────────────────────

export const expertDetailSchema = expertSummarySchema.extend({
  detailIntroduction: z.string().optional(),
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

export type ExpertDetail = z.infer<typeof expertDetailSchema>

// ─── List Params ─────────────────────────────────────────────────────────────

export type ExpertListParams = {
  majorCategoryId?: number
  subCategoryId?: number
  region?: string
  method?: "OFFLINE" | "ONLINE" | "BOTH"
  minRating?: number
  sortBy?: ExpertSortBy
  cursor?: string
  size?: number
}

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const expertListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(expertSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const popularExpertListResponseSchema = successResponseSchema(
  z.array(expertSummarySchema),
)

export const expertDetailResponseSchema = successResponseSchema(expertDetailSchema)
