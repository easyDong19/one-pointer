import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const proposalStatusSchema = z.enum([
  "PENDING",
  "SELECTED",
  "COMPLETED",
  "REJECTED",
  "WITHDRAWN",
])

export const proposedDurationSchema = z.enum([
  "THIRTY_MIN",
  "ONE_HOUR",
  "ONE_HALF_HOUR",
  "TWO_HOUR",
  "NEGOTIABLE",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const methodSchema = z.enum(["OFFLINE", "ONLINE", "BOTH"])
export const authStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])

/** AvailableDateResponse */
export const availableDateSchema = z.object({
  availableDate: z.string(),
  timeSlot: z.string(),
})

/** CertificationResponse */
const certificationSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  issuer: z.string(),
})

/** PortfolioResponse */
const portfolioSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  imageUrls: z.array(z.string()),
  description: z.string(),
})

/** ExpertInfoResponse — `ProposalExpertInfoResponse` 백엔드 실측 */
export const expertInfoSchema = z.object({
  userId: z.number().nullish(),
  expertProfileId: z.number().nullish(),
  nickname: z.string().nullish(),
  profileImageUrl: z.string().url().nullish(),
  introduction: z.string().nullish(),
  detailIntroduction: z.string().nullish(),
  careerPeriod: z.string().nullish(),
  activityMethod: methodSchema.nullish(),
  authStatus: authStatusSchema.nullish(),
  certifications: z.array(certificationSchema).optional(),
  portfolios: z.array(portfolioSchema).optional(),
})

/** ClientProfileResponse */
export const clientProfileSchema = z.object({
  clientId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

/** ProposalSummaryResponse */
export const proposalSummarySchema = z.object({
  id: z.number(),
  expertProfileId: z.number().nullish(),
  expertNickname: z.string().nullish(),
  expertProfileImageUrl: z.string().url().nullish(),
  price: z.number().nullish(),
  proposedDuration: z.string().nullish(),
  method: methodSchema.nullish(),
  status: proposalStatusSchema.nullish(),
  ticketId: z.number().optional(),
  createdAt: z.string().nullish(),
})

/** ProposalDetailResponse */
export const proposalDetailSchema = z.object({
  id: z.number(),
  price: z.number().nullish(),
  proposedDuration: z.string().nullish(),
  method: methodSchema.nullish(),
  locationProposal: z.string().nullish(),
  onlineTool: z.string().nullish(),
  appeal: z.string().nullish(),
  status: proposalStatusSchema.nullish(),
  createdAt: z.string().nullish(),
  availableDates: z.array(availableDateSchema).nullish(),
  expertInfo: expertInfoSchema.nullish(),
  ticketId: z.number().optional(),
  expertProfileId: z.number().optional(),
  expertNickname: z.string().optional(),
  expertProfileImageUrl: z.string().url().nullish(),
})

/** MyProposalResponse — 백엔드 실측 (`MyProposalResponse.java`) */
export const myProposalSchema = z.object({
  id: z.number(),
  ticketTitle: z.string().nullish(),
  subCategoryName: z.string().nullish(),
  ticketType: z.enum(["OFFLINE", "ONLINE"]).nullish(),
  clientNickname: z.string().nullish(),
  status: proposalStatusSchema.nullish(),
  price: z.number().nullish(),
  createdAt: z.string().nullish(),
})

/** MyProposalTicketInfoResponse */
export const myProposalTicketInfoSchema = z.object({
  ticketId: z.number().nullish(),
  title: z.string().nullish(),
  content: z.string().nullish(),
  ticketType: z.enum(["OFFLINE", "ONLINE"]).nullish(),
  subCategoryName: z.string().nullish(),
  level: z.string().nullish(),
  desiredDuration: z.string().nullish(),
  budgetType: z.string().nullish(),
  budgetMin: z.number().nullish(),
  budgetMax: z.number().nullish(),
  region: z.string().nullish(),
  locationDetail: z.string().nullish(),
  ticketStatus: z.string().nullish(),
  clientNickname: z.string().nullish(),
  deadline: z.string().nullish(),
  createdAt: z.string().nullish(),
})

/** MyProposalDetailResponse */
export const myProposalDetailSchema = z.object({
  id: z.number(),
  price: z.number().nullish(),
  proposedDuration: z.string().nullish(),
  method: methodSchema.nullish(),
  locationProposal: z.string().nullish(),
  onlineTool: z.string().nullish(),
  appeal: z.string().nullish(),
  status: proposalStatusSchema.nullish(),
  createdAt: z.string().nullish(),
  availableDates: z.array(availableDateSchema).nullish(),
  ticketInfo: myProposalTicketInfoSchema.nullish(),
})

/** AcceptProposalResponse */
export const acceptProposalSchema = z.object({
  chatRoomId: z.string(),
})

export type ProposalSummary = z.infer<typeof proposalSummarySchema>
export type ProposalDetail = z.infer<typeof proposalDetailSchema>
export type MyProposal = z.infer<typeof myProposalSchema>
export type MyProposalDetail = z.infer<typeof myProposalDetailSchema>
export type AcceptProposal = z.infer<typeof acceptProposalSchema>
export type ExpertInfo = z.infer<typeof expertInfoSchema>
export type ClientProfile = z.infer<typeof clientProfileSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const createProposalRequestSchema = z.object({
  ticketId: z.number(),
  price: z.number().min(0),
  proposedDuration: proposedDurationSchema.optional(),
  locationProposal: z.string().optional(),
  onlineTool: z.string().optional(),
  appeal: z.string().optional(),
  availableDates: z.array(availableDateSchema).optional(),
})

export type CreateProposalRequest = z.infer<typeof createProposalRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const proposalDetailResponseSchema = successResponseSchema(proposalDetailSchema)

/** 의뢰별 제안 목록 — 백엔드 `List<ProposalSummaryResponse>` (커서 X) */
export const proposalsByTicketResponseSchema = successResponseSchema(
  z.array(proposalSummarySchema),
)

/** 내 제안 목록 — `CursorPageResponse<MyProposalResponse>` */
export const myProposalListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myProposalSchema),
    nextCursor: z.union([z.string(), z.number()]).nullish(),
    hasNext: z.boolean().nullish(),
  }),
)

export const myProposalDetailResponseSchema = successResponseSchema(myProposalDetailSchema)

export const acceptProposalResponseSchema = successResponseSchema(acceptProposalSchema)
