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
  id: z.number().int(),
  benefitType: benefitTypeSchema,
  status: benefitStatusSchema.nullish(),
})

/** CategoryGroupResponse */
export const expertCategorySchema = z.object({
  majorCategoryName: z.string(),
  majorCategoryIconUrl: z.string().nullish(),
  subCategoryNames: z.array(z.string()).nullish(),
})

/** AvailableTimeResponse */
export const expertAvailableTimeSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

/** CertificationResponse */
export const expertCertificationSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  issuer: z.string().nullish(),
})

/** PortfolioResponse */
export const expertPortfolioSchema = z.object({
  id: z.number().int(),
  type: z.string().nullish(),
  description: z.string().nullish(),
  imageUrls: z.array(z.string()).nullish(),
})

/** ReviewSummaryResponse */
export const expertReviewSummarySchema = z.object({
  averageRating: z.number().nullish(),
  reviewCount: z.number().int().nullish(),
  totalMatchCount: z.number().int().nullish(),
})

// ─── ExpertProfileDetailResponse ────────────────────────────────────────────

/** ExpertProfileDetailResponse */
export const expertDetailSchema = z.object({
  expertProfileId: z.number().int(),
  userId: z.number().int(),
  nickname: z.string(),
  profileImageUrl: z.string().nullish(),
  bannerImageUrl: z.string().nullish(),
  introduction: z.string().nullish(),
  detailIntroduction: z.string().nullish(),
  careerPeriod: z.string().nullish(),
  activityMethod: activityMethodSchema.nullish(),
  authStatus: expertAuthStatusSchema.nullish(),
  grade: expertGradeSchema.nullish(),
  activeBenefits: z.array(benefitResponseSchema).nullish(),
  categories: z.array(expertCategorySchema).nullish(),
  availableRegions: z.array(z.string()).nullish(),
  availableTimes: z.array(expertAvailableTimeSchema).nullish(),
  certifications: z.array(expertCertificationSchema).nullish(),
  portfolios: z.array(expertPortfolioSchema).nullish(),
  reviewSummary: expertReviewSummarySchema.nullish(),
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
