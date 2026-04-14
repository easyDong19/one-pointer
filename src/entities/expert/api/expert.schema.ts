import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const activityMethodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])
export const expertGradeSchema = z.enum(["EARLY_BIRD", "STANDARD", "PREMIUM"])
export const expertAuthStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])
export const benefitTypeSchema = z.enum([
  "PROFILE_AD",
  "BUSINESS_AD",
  "EARLY_BIRD_BADGE",
  "FEE_DISCOUNT",
  "PRIORITY_LISTING",
])
export const benefitStatusSchema = z.enum(["ACTIVE", "EXPIRED", "REVOKED"])
export const expertSortBySchema = z.enum(["RATING_DESC", "MATCH_COUNT_DESC", "LATEST"])
export type ExpertSortBy = z.infer<typeof expertSortBySchema>

// ─── ExpertSummaryResponse (리스트 + 인기 전문가 공용) ────────────────────────

/** ExpertSummaryResponse */
export const expertSummarySchema = z.object({
  expertProfileId: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().nullable(),
  introduction: z.string(),
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  matchCount: z.number(),
  activityMethod: activityMethodSchema,
  // FE-only / extended fields kept for backwards compatibility
  grade: expertGradeSchema.optional(),
  careerPeriod: z.string().optional(),
  categoryNames: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
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

// ─── Sub-schemas for ExpertDetail ───────────────────────────────────────────

/** BenefitResponse */
export const benefitResponseSchema = z.object({
  id: z.number(),
  benefitType: benefitTypeSchema,
  status: benefitStatusSchema,
})

/** CategoryGroupResponse */
export const expertCategorySchema = z.object({
  majorCategoryName: z.string(),
  majorCategoryIconUrl: z.string(),
  subCategoryNames: z.array(z.string()),
})

/** AvailableTimeResponse */
export const expertAvailableTimeSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

/** CertificationResponse */
export const expertCertificationSchema = z.object({
  id: z.number(),
  name: z.string(),
  issuer: z.string(),
})

/** PortfolioResponse */
export const expertPortfolioSchema = z.object({
  id: z.number(),
  type: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()),
})

/** ReviewSummaryResponse */
export const expertReviewSummarySchema = z.object({
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  totalMatchCount: z.number(),
})

// ─── ExpertProfileDetailResponse ────────────────────────────────────────────

/** ExpertProfileDetailResponse */
export const expertDetailSchema = z.object({
  expertProfileId: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().nullable(),
  introduction: z.string(),
  detailIntroduction: z.string(),
  careerPeriod: z.string(),
  activityMethod: activityMethodSchema,
  authStatus: expertAuthStatusSchema,
  grade: expertGradeSchema,
  activeBenefits: z.array(benefitResponseSchema),
  categories: z.array(expertCategorySchema),
  availableRegions: z.array(z.string()),
  availableTimes: z.array(expertAvailableTimeSchema),
  certifications: z.array(expertCertificationSchema),
  portfolios: z.array(expertPortfolioSchema),
  reviewSummary: expertReviewSummarySchema,
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
