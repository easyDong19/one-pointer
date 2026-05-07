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
  "DELIVERY_REJECTED_EXPERT",
  "DELIVERY_REJECTED_CLIENT",
  "TICKET_CANCELLED",
  "TICKET_EXPIRED",
  "REVIEW_PUBLISHED",
  "EXPERT_REPLY",
  "CHAT_REMINDER",
  "CHAT_MESSAGE",
  "COUPON_EXPIRING",
  "AGREEMENT_PROPOSED",
  "AGREEMENT_CONFIRMED",
  "AGREEMENT_REJECTED",
  "AGREEMENT_REPROPOSED",
  "ESCROW_PAYMENT_COMPLETED",
  "ESCROW_SETTLED",
  "DIRECT_REQUEST_RECEIVED",
  "DIRECT_REQUEST_REJECTED",
  "DIRECT_REQUEST_EXPIRED",
  "DISPUTE_SUBMITTED_APPLICANT",
  "DISPUTE_SUBMITTED_RESPONDENT",
  "DISPUTE_REJECTED",
  "DISPUTE_UNDER_REVIEW",
  "DISPUTE_RESPONDENT_STATEMENT",
  "DISPUTE_RESOLVED",
  "DISPUTE_CLOSED",
  "DISPUTE_CANCELLED",
  "ESCROW_REFUND_REQUESTED_CLIENT",
  "ESCROW_REFUND_REQUESTED_EXPERT",
  "ESCROW_REFUND_COOLING_OFF",
  "ESCROW_REFUND_EXPERT_ACCEPTED",
  "ESCROW_REFUND_EXPERT_REJECTED",
  "ESCROW_REFUND_AUTO_APPROVED",
  "ESCROW_REFUND_COMPLETED",
  "DEADLINE_OVERDUE_CLIENT",
  "DEADLINE_OVERDUE_EXPERT",
  "DEADLINE_EXTENDED_CLIENT",
  "DEADLINE_EXTENDED_EXPERT",
  "REFERRAL_COUPON_ISSUED",
  "ADMIN_NOTICE",
  "ADMIN_INDIVIDUAL",
])

export type NotificationType = z.infer<typeof notificationTypeSchema>

export const notificationTargetTypeSchema = z.enum([
  "TICKET",
  "REVIEW",
  "PROPOSAL",
  "DISPUTE",
  "NONE",
])

export type NotificationTargetType = z.infer<typeof notificationTargetTypeSchema>

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** 실측 API 응답 필드 기준 */
export const notificationSchema = z.object({
  id: z.number(),
  type: notificationTypeSchema,
  targetType: notificationTargetTypeSchema,
  title: z.string(),
  body: z.string(),
  targetId: z.number().nullable(),
  roomId: z.string().nullable().optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
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

export const unreadCountResponseSchema = successResponseSchema(z.number())
