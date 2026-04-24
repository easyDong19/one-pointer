import { z } from "zod/v4"
import {
  expertDetailSchema,
  expertDetailResponseSchema,
  expertAuthStatusSchema,
  expertGradeSchema,
  benefitResponseSchema as expertBenefitResponseSchema,
  expertCategorySchema,
  expertAvailableTimeSchema,
  expertCertificationSchema,
  expertPortfolioSchema,
  expertReviewSummarySchema,
} from "@/entities/expert/api/expert.schema"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const preferredMethodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])
export const activityMethodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])
export const deviceTypeSchema = z.enum(["WEB", "ANDROID", "IOS"])
export const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** AvailableTimeResponse */
export const availableTimeSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string(),
  endTime: z.string(),
})

/** CertificationResponse */
export const certificationSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  issuer: z.string(),
})

/** PortfolioResponse */
export const portfolioSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  imageUrls: z.array(z.string()),
  description: z.string(),
})

export const expertProfileSummarySchema = z.object({
  id: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().nullish(),
  introduction: z.string(),
  activityMethod: activityMethodSchema,
  averageRating: z.number().nullish(),
  reviewCount: z.number().nullish(),
  subCategories: z.array(z.object({ id: z.number(), name: z.string() })).nullish(),
})

/** BankAccountResponse (프로필용 — 모든 필드 nullable) */
const profileBankAccountSchema = z.object({
  bankCode: z.string().nullish(),
  accountNumber: z.string().nullish(),
  accountHolder: z.string().nullish(),
})

/** MyExpertProfileResponse — ExpertProfileDetailResponse + bankAccount, userId 없음 */
export const myExpertProfileSchema = z.object({
  expertProfileId: z.number().int(),
  nickname: z.string(),
  profileImageUrl: z.string().nullish(),
  bannerImageUrl: z.string().nullish(),
  introduction: z.string().nullish(),
  detailIntroduction: z.string().nullish(),
  careerPeriod: z.string().nullish(),
  activityMethod: activityMethodSchema.nullish(),
  authStatus: expertAuthStatusSchema.nullish(),
  grade: expertGradeSchema.nullish(),
  activeBenefits: z.array(expertBenefitResponseSchema).nullish(),
  categories: z.array(expertCategorySchema).nullish(),
  availableRegions: z.array(z.string()).nullish(),
  availableTimes: z.array(expertAvailableTimeSchema).nullish(),
  certifications: z.array(expertCertificationSchema).nullish(),
  portfolios: z.array(expertPortfolioSchema).nullish(),
  reviewSummary: expertReviewSummarySchema.nullish(),
  bankAccount: profileBankAccountSchema.nullish(),
})

export type ExpertProfileSummary = z.infer<typeof expertProfileSummarySchema>
export type MyExpertProfile = z.infer<typeof myExpertProfileSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const updateProfileRequestSchema = z.object({
  nickname: z.string().optional(),
  profileImageUrl: z.string().optional(),
  region: z.string().optional(),
  preferredMethod: preferredMethodSchema.optional(),
})

export const updateFcmTokenRequestSchema = z.object({
  fcmToken: z.string().min(1),
  deviceId: z.string().min(1),
  deviceType: deviceTypeSchema,
})

export const deleteFcmTokenRequestSchema = z.object({
  deviceId: z.string().min(1),
})

export const expertRegisterRequestSchema = z.object({
  introduction: z.string().min(1),
  detailIntroduction: z.string().optional(),
  careerPeriod: z.string().optional(),
  activityMethod: activityMethodSchema,
  bannerImageUrl: z.string().optional(),
  certifications: z
    .array(z.object({ name: z.string(), issuer: z.string() }))
    .optional(),
  portfolios: z
    .array(
      z.object({
        type: z.string(),
        imageUrls: z.array(z.string()),
        description: z.string(),
      }),
    )
    .optional(),
  availableTimes: z
    .array(z.object({ dayOfWeek: z.string(), startTime: z.string(), endTime: z.string() }))
    .optional(),
  availableRegions: z.array(z.string()).optional(),
  subCategoryIds: z.array(z.number()),
  bankCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountHolder: z.string().optional(),
})

export const updateExpertProfileRequestSchema = z.object({
  introduction: z.string().optional(),
  detailIntroduction: z.string().optional(),
  careerPeriod: z.string().optional(),
  activityMethod: activityMethodSchema.optional(),
  bannerImageUrl: z.string().optional(),
  subCategoryIds: z.array(z.number()).optional(),
  availableTimes: z
    .array(z.object({ dayOfWeek: z.string(), startTime: z.string(), endTime: z.string() }))
    .optional(),
  availableRegions: z.array(z.string()).optional(),
})

export const addPortfolioRequestSchema = z.object({
  type: z.string(),
  imageUrls: z.array(z.string()),
  description: z.string(),
})

export const addCertificationRequestSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
})

export const updateBankAccountRequestSchema = z.object({
  bankCode: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(1),
})

export const updateAvailabilityRequestSchema = z.object({
  availableTimes: z.array(z.object({ dayOfWeek: z.string(), startTime: z.string(), endTime: z.string() })),
  availableRegions: z.array(z.string()),
})

export const updateNotificationRequestSchema = z.object({
  notificationEnabled: z.boolean(),
})

export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>
export type UpdateFcmTokenRequest = z.infer<typeof updateFcmTokenRequestSchema>
export type DeleteFcmTokenRequest = z.infer<typeof deleteFcmTokenRequestSchema>
export type ExpertRegisterRequest = z.infer<typeof expertRegisterRequestSchema>
export type UpdateExpertProfileRequest = z.infer<typeof updateExpertProfileRequestSchema>
export type AddPortfolioRequest = z.infer<typeof addPortfolioRequestSchema>
export type AddCertificationRequest = z.infer<typeof addCertificationRequestSchema>
export type UpdateBankAccountRequest = z.infer<typeof updateBankAccountRequestSchema>
export type UpdateAvailabilityRequest = z.infer<typeof updateAvailabilityRequestSchema>
export type UpdateNotificationRequest = z.infer<typeof updateNotificationRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const updateProfileResponseSchema = successResponseSchema(z.unknown())
export const updateFcmTokenResponseSchema = successResponseSchema(z.null())
export const deleteFcmTokenResponseSchema = successResponseSchema(z.null())
export const expertRegisterResponseSchema = successResponseSchema(z.unknown())
export const updateExpertProfileResponseSchema = successResponseSchema(z.unknown())

export const myExpertProfileResponseSchema = successResponseSchema(myExpertProfileSchema)
export { expertDetailResponseSchema }
export const expertProfileExistsResponseSchema = successResponseSchema(z.boolean())

export const portfolioResponseSchema = successResponseSchema(portfolioSchema)

// ─── Dashboards ──────────────────────────────────────────────────────────────

/** ExpertDashboardResponse */
export const expertDashboardSchema = z.object({
  sentProposalCount: z.number(),
  inProgressTicketCount: z.number(),
  averageRating: z.number().nullable(),
  totalEarnings: z.number(),
  // legacy FE fields (kept for backward compatibility)
  pendingProposals: z.number().optional(),
  inProgressTickets: z.number().optional(),
  completedTickets: z.number().optional(),
})

export const expertDashboardResponseSchema = successResponseSchema(expertDashboardSchema)

/** ClientDashboardResponse */
export const clientDashboardSchema = z.object({
  availableCouponCount: z.number(),
  inProgressTicketCount: z.number(),
  completedMatchCount: z.number(),
  writtenReviewCount: z.number(),
  // legacy FE fields (kept for backward compatibility)
  openTickets: z.number().optional(),
  inProgressTickets: z.number().optional(),
  completedTickets: z.number().optional(),
  couponBalance: z.number().optional(),
})

export const clientDashboardResponseSchema = successResponseSchema(clientDashboardSchema)

export type ExpertDashboard = z.infer<typeof expertDashboardSchema>
export type ClientDashboard = z.infer<typeof clientDashboardSchema>
