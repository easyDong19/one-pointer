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

export const escrowRefundZoneSchema = z.enum([
  "COOLING_OFF",
  "WORK_IN_PROGRESS",
  "DEADLINE_GRACE",
  "DEADLINE_WAIT",
])

export const escrowRefundStatusSchema = z.enum([
  "REQUESTED",
  "EXPERT_ACCEPTED",
  "EXPERT_REJECTED",
  "AUTO_APPROVED",
  "REFUNDED",
  "CANCELLED",
  "CONVERTED_TO_DISPUTE",
  "DISPUTE_FULL_REFUND",
  "DISPUTE_EXPERT_SETTLEMENT",
  "DISPUTE_CLOSED",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** EscrowPaymentResponse */
export const escrowPaymentSchema = z.object({
  id: z.number(),
  orderId: z.string(),
  ticketId: z.number(),
  amount: z.number(),
  paymentMethod: paymentMethodSchema,
  status: escrowPaymentStatusSchema,
  paidAt: z.string(),
  // FE-only fields
  paymentKey: z.string().optional(),
  createdAt: z.string().optional(),
})

/** EscrowRefundResponse */
export const escrowRefundSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  zone: escrowRefundZoneSchema,
  reason: z.string(),
  status: escrowRefundStatusSchema,
  requestedAt: z.string(),
  expertResponseDeadline: z.string(),
  expertRespondedAt: z.string().nullable(),
  expertRejectReason: z.string().nullable(),
  refundedAt: z.string().nullable(),
  disputeId: z.number().nullable(),
})

export type EscrowPayment = z.infer<typeof escrowPaymentSchema>
export type EscrowRefund = z.infer<typeof escrowRefundSchema>
export type EscrowRefundZone = z.infer<typeof escrowRefundZoneSchema>
export type EscrowRefundStatus = z.infer<typeof escrowRefundStatusSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const escrowPaymentRequestSchema = z.object({
  ticketId: z.number(),
  paymentMethod: paymentMethodSchema,
  paymentKey: z.string().min(1),
})

export const refundRequestSchema = z.object({
  ticketId: z.number(),
  reason: z.string().min(1),
})

export const refundRespondRequestSchema = z.object({
  accept: z.boolean(),
  rejectReason: z.string().nullable().optional(),
})

export type EscrowPaymentRequest = z.infer<typeof escrowPaymentRequestSchema>
export type RefundRequest = z.infer<typeof refundRequestSchema>
export type RefundRespondRequest = z.infer<typeof refundRespondRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const escrowPaymentResponseSchema = successResponseSchema(escrowPaymentSchema)
export const escrowRefundResponseSchema = successResponseSchema(escrowRefundSchema)
