import { z } from "zod/v4"

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

export const availableTimeSchema = z.object({
  dayOfWeek: z.string(),
  timeSlot: z.string(),
})

export const certificationSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  issuer: z.string(),
})

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
  profileImageUrl: z.string().url().nullable().optional(),
  introduction: z.string(),
  activityMethod: activityMethodSchema,
  averageRating: z.number().nullable().optional(),
  reviewCount: z.number().optional(),
  subCategories: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
})

export const expertProfileDetailSchema = z.object({
  id: z.number(),
  userId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
  introduction: z.string(),
  detailIntroduction: z.string().optional(),
  careerPeriod: z.string().optional(),
  activityMethod: activityMethodSchema,
  averageRating: z.number().nullable().optional(),
  reviewCount: z.number().optional(),
  availableTimes: z.array(availableTimeSchema).optional(),
  availableRegions: z.array(z.string()).optional(),
  subCategories: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  certifications: z.array(certificationSchema).optional(),
  portfolios: z.array(portfolioSchema).optional(),
})

export type ExpertProfileSummary = z.infer<typeof expertProfileSummarySchema>
export type ExpertProfileDetail = z.infer<typeof expertProfileDetailSchema>

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
    .array(z.object({ dayOfWeek: z.string(), timeSlot: z.string() }))
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
  subCategoryIds: z.array(z.number()).optional(),
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
  availableTimes: z.array(z.object({ dayOfWeek: z.string(), timeSlot: z.string() })),
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

export const expertProfileDetailResponseSchema = successResponseSchema(expertProfileDetailSchema)
export const expertProfileExistsResponseSchema = successResponseSchema(z.boolean())

export const portfolioResponseSchema = successResponseSchema(portfolioSchema)

export const earningsSummarySchema = z.object({
  totalEarnings: z.number(),
  pendingSettlement: z.number(),
  completedSettlement: z.number(),
})

export const earningsSummaryResponseSchema = successResponseSchema(earningsSummarySchema)

export const transactionItemSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  amount: z.number(),
  status: z.string(),
  createdAt: z.string(),
})

export const transactionsResponseSchema = successResponseSchema(
  z.object({
    content: z.array(transactionItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const expertDashboardSchema = z.object({
  pendingProposals: z.number().optional(),
  inProgressTickets: z.number().optional(),
  completedTickets: z.number().optional(),
  averageRating: z.number().nullable().optional(),
})

export const expertDashboardResponseSchema = successResponseSchema(expertDashboardSchema)

export const clientDashboardSchema = z.object({
  openTickets: z.number().optional(),
  inProgressTickets: z.number().optional(),
  completedTickets: z.number().optional(),
  couponBalance: z.number().optional(),
})

export const clientDashboardResponseSchema = successResponseSchema(clientDashboardSchema)

export type EarningsSummary = z.infer<typeof earningsSummarySchema>
export type TransactionItem = z.infer<typeof transactionItemSchema>
export type ExpertDashboard = z.infer<typeof expertDashboardSchema>
export type ClientDashboard = z.infer<typeof clientDashboardSchema>
