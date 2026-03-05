import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const disputeStatusSchema = z.enum([
  "SUBMITTED",
  "UNDER_REVIEW",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
  "REJECTED",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const evidenceSchema = z.object({
  fileUrl: z.string(),
  fileName: z.string(),
})

export const disputeSchema = z.object({
  id: z.number(),
  escrowPaymentId: z.number(),
  applicantId: z.number(),
  respondentId: z.number().nullable().optional(),
  reasonCategory: z.string(),
  description: z.string(),
  status: disputeStatusSchema,
  statement: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  evidences: z.array(evidenceSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
})

export const eligibleTransactionSchema = z.object({
  escrowPaymentId: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string(),
  amount: z.number(),
  paidAt: z.string(),
})

export type Evidence = z.infer<typeof evidenceSchema>
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

export const disputeListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(disputeSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const eligibleTransactionListResponseSchema = successResponseSchema(
  z.array(eligibleTransactionSchema),
)
