import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const agreementStatusSchema = z.enum(["PROPOSED", "CONFIRMED", "REJECTED"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** AgreementResponse */
export const agreementSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  finalPrice: z.number(),
  workDeadline: z.string(),
  scope: z.string(),
  maxRevisions: z.number(),
  deliveryFormat: z.string(),
  status: agreementStatusSchema,
  proposedBy: z.number(),
  proposedAt: z.string(),
  confirmedAt: z.string().nullable(),
  createdAt: z.string(),
  // FE-only fields (not in Swagger but used in frontend)
  expertProfileId: z.number().optional(),
  clientId: z.number().optional(),
  updatedAt: z.string().optional(),
})

export type Agreement = z.infer<typeof agreementSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const createAgreementRequestSchema = z.object({
  ticketId: z.number(),
  finalPrice: z.number().min(0),
  workDeadline: z.string(),
  scope: z.string().optional(),
  maxRevisions: z.number().int().min(0).optional(),
  deliveryFormat: z.string().optional(),
})

export const reproposeAgreementRequestSchema = z.object({
  finalPrice: z.number().min(0),
  workDeadline: z.string(),
  scope: z.string().optional(),
  maxRevisions: z.number().int().min(0).optional(),
  deliveryFormat: z.string().optional(),
})

export const updateAgreementDeadlineRequestSchema = z.object({
  workDeadline: z.string(),
})

export type CreateAgreementRequest = z.infer<typeof createAgreementRequestSchema>
export type ReproposeAgreementRequest = z.infer<typeof reproposeAgreementRequestSchema>
export type UpdateAgreementDeadlineRequest = z.infer<typeof updateAgreementDeadlineRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const agreementResponseSchema = successResponseSchema(agreementSchema)
