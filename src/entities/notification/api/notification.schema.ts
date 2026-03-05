import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const notificationTypeSchema = z.enum([
  "NEW_TICKET",
  "PROPOSAL_RECEIVED",
  "TICKET_MATCHED_CLIENT",
  "TICKET_MATCHED_EXPERT",
  "DELIVERY_SUBMITTED",
  "DELIVERY_APPROVED",
  "REVISION_REQUESTED",
  "DELIVERY_RESUBMITTED",
  "TICKET_AUTO_COMPLETED",
  "DELIVERY_AUTO_APPROVED",
  "DELIVERY_APPROVE_REMINDER",
  "TICKET_CANCELLED",
  "TICKET_EXPIRED",
  "REVIEW_PUBLISHED",
  "EXPERT_REPLY",
  "CHAT_REMINDER",
  "COUPON_EXPIRING",
  "AGREEMENT_CONFIRMED",
  "ESCROW_PAYMENT_COMPLETED",
  "ESCROW_SETTLED",
  "DIRECT_REQUEST_RECEIVED",
  "DIRECT_REQUEST_EXPIRED",
  "DISPUTE_SUBMITTED_APPLICANT",
  "DISPUTE_SUBMITTED_RESPONDENT",
  "DISPUTE_REJECTED",
  "DISPUTE_UNDER_REVIEW",
  "DISPUTE_RESPONDENT_STATEMENT",
  "DISPUTE_RESOLVED",
  "DISPUTE_CLOSED",
  "DISPUTE_CANCELLED",
])

export type NotificationType = z.infer<typeof notificationTypeSchema>

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const notificationSchema = z.object({
  id: z.number(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string().optional(),
  isRead: z.boolean(),
  referenceId: z.number().nullable().optional(),
  createdAt: z.string(),
})

export const unreadCountSchema = z.object({
  count: z.number(),
})

export type Notification = z.infer<typeof notificationSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const notificationListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(notificationSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const unreadCountResponseSchema = successResponseSchema(unreadCountSchema)
