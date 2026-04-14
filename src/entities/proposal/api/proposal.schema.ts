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

/** ExpertInfoResponse */
export const expertInfoSchema = z.object({
  userId: z.number(),
  expertProfileId: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
  introduction: z.string(),
  detailIntroduction: z.string(),
  careerPeriod: z.string(),
  activityMethod: methodSchema,
  authStatus: authStatusSchema,
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
  expertProfileId: z.number(),
  expertNickname: z.string(),
  expertProfileImageUrl: z.string().url().nullable().optional(),
  price: z.number(),
  proposedDuration: z.string(),
  method: methodSchema,
  status: z.enum(["PENDING"]),
  // legacy FE fields (kept for backward compatibility)
  ticketId: z.number().optional(),
  createdAt: z.string().optional(),
})

/** ProposalDetailResponse */
export const proposalDetailSchema = z.object({
  id: z.number(),
  price: z.number(),
  proposedDuration: z.string(),
  method: methodSchema,
  locationProposal: z.string().nullable(),
  onlineTool: z.string().nullable(),
  appeal: z.string(),
  status: proposalStatusSchema,
  createdAt: z.string(),
  availableDates: z.array(availableDateSchema).optional(),
  expertInfo: expertInfoSchema.optional(),
  // legacy FE fields (kept for backward compatibility)
  ticketId: z.number().optional(),
  expertProfileId: z.number().optional(),
  expertNickname: z.string().optional(),
  expertProfileImageUrl: z.string().url().nullable().optional(),
})

/** MyProposalResponse */
export const myProposalSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  ticketType: z.enum(["OFFLINE", "ONLINE"]),
  price: z.number(),
  status: proposalStatusSchema,
  clientNickname: z.string(),
  clientProfileImageUrl: z.string().url().nullable().optional(),
  proposedDuration: z.string(),
  createdAt: z.string(),
})

/** MyProposalDetailResponse */
export const myProposalDetailSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  ticketType: z.enum(["OFFLINE", "ONLINE"]),
  price: z.number(),
  proposedDuration: z.string(),
  method: methodSchema,
  locationProposal: z.string().nullable(),
  onlineTool: z.string().nullable(),
  appeal: z.string(),
  status: proposalStatusSchema,
  createdAt: z.string(),
  availableDates: z.array(availableDateSchema).optional(),
  clientInfo: clientProfileSchema.optional(),
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

export const proposalListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(proposalSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const myProposalListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myProposalSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const myProposalDetailResponseSchema = successResponseSchema(myProposalDetailSchema)

export const acceptProposalResponseSchema = successResponseSchema(acceptProposalSchema)
