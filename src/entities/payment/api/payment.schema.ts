import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const paymentMethodSchema = z.enum(["CARD", "EASY_PAY", "TRANSFER"])

export const escrowPaymentStatusSchema = z.enum([
  "PENDING",
  "ESCROW_HELD",
  "WORK_IN_PROGRESS",
  "DELIVERED",
  "REVISION_REQUESTED",
  "CONFIRMED",
  "AUTO_CONFIRMED",
  "SETTLED",
  "REFUND_REQUESTED",
  "REFUNDED",
  "DISPUTE",
  "CANCELLED",
  "FAILED",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const escrowPaymentSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  amount: z.number(),
  paymentMethod: paymentMethodSchema.optional(),
  status: escrowPaymentStatusSchema,
  paymentKey: z.string().optional(),
  paidAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

export type EscrowPayment = z.infer<typeof escrowPaymentSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const escrowPaymentRequestSchema = z.object({
  ticketId: z.number(),
  paymentMethod: paymentMethodSchema,
  paymentKey: z.string().min(1),
})

export type EscrowPaymentRequest = z.infer<typeof escrowPaymentRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const escrowPaymentResponseSchema = successResponseSchema(escrowPaymentSchema)
