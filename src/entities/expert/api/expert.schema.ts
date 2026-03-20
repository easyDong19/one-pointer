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

export const expertCategorySchema = z.object({
  majorCategoryName: z.string(),
  majorCategoryIconUrl: z.string().nullable().optional(),
  subCategoryNames: z.array(z.string()),
})

export const expertAvailableTimeSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

export const expertCertificationSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  issuer: z.string(),
})

export const expertPortfolioSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  imageUrls: z.array(z.string()),
  description: z.string(),
})

export const expertReviewSummarySchema = z.object({
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  totalMatchCount: z.number(),
})

export const expertAuthStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])

export const expertDetailSchema = z.object({
  expertProfileId: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().nullable(),
  introduction: z.string(),
  detailIntroduction: z.string().nullable().optional(),
  careerPeriod: z.string(),
  activityMethod: activityMethodSchema,
  authStatus: expertAuthStatusSchema.optional(),
  grade: expertGradeSchema,
  activeBenefits: z.array(z.string()).optional(),
  categories: z.array(expertCategorySchema),
  availableRegions: z.array(z.string()),
  availableTimes: z.array(expertAvailableTimeSchema).optional(),
  certifications: z.array(expertCertificationSchema).optional(),
  portfolios: z.array(expertPortfolioSchema).optional(),
  reviewSummary: expertReviewSummarySchema.optional(),
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
