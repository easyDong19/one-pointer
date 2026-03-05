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

export const availableDateSchema = z.object({
  availableDate: z.string(),
  timeSlot: z.string(),
})

export const proposalSummarySchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  expertProfileId: z.number(),
  expertNickname: z.string(),
  expertProfileImageUrl: z.string().url().nullable().optional(),
  price: z.number(),
  proposedDuration: proposedDurationSchema.optional(),
  status: proposalStatusSchema,
  createdAt: z.string(),
})

export const proposalDetailSchema = proposalSummarySchema.extend({
  locationProposal: z.string().nullable().optional(),
  onlineTool: z.string().nullable().optional(),
  appeal: z.string().optional(),
  availableDates: z.array(availableDateSchema).optional(),
})

export type ProposalSummary = z.infer<typeof proposalSummarySchema>
export type ProposalDetail = z.infer<typeof proposalDetailSchema>

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
