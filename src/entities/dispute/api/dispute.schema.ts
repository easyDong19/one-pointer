import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const disputeStatusSchema = z.enum([
  "SUBMITTED",
  "REJECTED",
  "UNDER_REVIEW",
  "RESOLVED",
  "CLOSED_UNRESOLVED",
  "CANCELLED",
])

export const disputeReasonCategorySchema = z.enum([
  "WORK_NOT_STARTED",
  "WORK_INCOMPLETE",
  "WORK_QUALITY_ISSUE",
  "DEADLINE_EXCEEDED",
  "COMMUNICATION_ISSUE",
  "SCOPE_CHANGE",
  "UNREASONABLE_REVISION",
  "CLIENT_UNRESPONSIVE",
  "OTHER",
])

export const disputeResolutionTypeSchema = z.enum([
  "FULL_REFUND",
  "PARTIAL_REFUND",
  "EXPERT_SETTLEMENT",
])

export const ticketTypeSchema = z.enum(["OFFLINE", "ONLINE"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** DisputeEvidence */
export const evidenceSchema = z.object({
  fileUrl: z.string(),
  fileName: z.string(),
})

/** MyDisputeListResponse */
export const myDisputeListItemSchema = z.object({
  disputeId: z.number(),
  ticketTitle: z.string(),
  ticketType: ticketTypeSchema,
  applicantId: z.number(),
  applicantNickname: z.string(),
  respondentId: z.number(),
  respondentNickname: z.string(),
  status: disputeStatusSchema,
  appliedAt: z.string(),
})

/** MyDisputeDetailResponse */
export const myDisputeDetailSchema = z.object({
  disputeId: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  ticketType: ticketTypeSchema,
  applicantId: z.number(),
  applicantNickname: z.string(),
  respondentId: z.number(),
  respondentNickname: z.string(),
  reason: z.string(),
  applicantStatement: z.string().nullable(),
  respondentStatement: z.string().nullable(),
  status: disputeStatusSchema,
  appliedAt: z.string(),
  respondedAt: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  adminRemark: z.string().nullable(),
  applicantEvidences: z.array(evidenceSchema),
  respondentEvidences: z.array(evidenceSchema),
})

/** DisputeResponse */
export const disputeSchema = z.object({
  disputeId: z.number(),
  ticketId: z.number(),
  reason: z.string(),
  status: disputeStatusSchema,
  appliedAt: z.string(),
})

export const eligibleTransactionSchema = z.object({
  escrowPaymentId: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  amount: z.number(),
  paidAt: z.string(),
})

export type Evidence = z.infer<typeof evidenceSchema>
export type MyDisputeListItem = z.infer<typeof myDisputeListItemSchema>
export type MyDisputeDetail = z.infer<typeof myDisputeDetailSchema>
export type Dispute = z.infer<typeof disputeSchema>
export type EligibleTransaction = z.infer<typeof eligibleTransactionSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const createDisputeRequestSchema = z.object({
  escrowPaymentId: z.number(),
  reasonCategory: z.string().min(1),
  description: z.string().min(1),
  contactEmail: z.string().email(),
  evidences: z.array(evidenceSchema).optional(),
})

export const respondDisputeRequestSchema = z.object({
  statement: z.string().min(1),
  contactEmail: z.string().email(),
  evidences: z.array(evidenceSchema).optional(),
})

export const addEvidenceRequestSchema = z.object({
  evidences: z.array(evidenceSchema),
})

export type CreateDisputeRequest = z.infer<typeof createDisputeRequestSchema>
export type RespondDisputeRequest = z.infer<typeof respondDisputeRequestSchema>
export type AddEvidenceRequest = z.infer<typeof addEvidenceRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const disputeResponseSchema = successResponseSchema(disputeSchema)

export const disputeDetailResponseSchema = successResponseSchema(myDisputeDetailSchema)

export const disputeListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myDisputeListItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const eligibleTransactionListResponseSchema = successResponseSchema(
  z.array(eligibleTransactionSchema),
)
