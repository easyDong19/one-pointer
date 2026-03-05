import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const reviewStatusSchema = z.enum(["FILTERING", "WAITING_RATING", "PUBLISHED"])
export const messageVisibilitySchema = z.enum(["PUBLIC", "HIDDEN_BY_SENDER", "HIDDEN_BY_SYSTEM"])
export const visibilityReasonSchema = z.enum(["PERSONAL", "SENSITIVE", "OTHER"])
export const ticketTypeSchema = z.enum(["OFFLINE", "ONLINE"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const snapshotMessageSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  senderNickname: z.string(),
  content: z.string(),
  visibility: messageVisibilitySchema,
  sentAt: z.string(),
})

export const communicationMetricsSchema = z.object({
  clientMessageCount: z.number().optional(),
  expertMessageCount: z.number().optional(),
  totalMessages: z.number().optional(),
  hiddenRatio: z.number().optional(),
})

export const expertReplySchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.string(),
})

export const clientProfileSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

export const reviewSummarySchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketType: ticketTypeSchema.optional(),
  expertProfileId: z.number(),
  status: reviewStatusSchema,
  rating: z.number().nullable().optional(),
  helpfulCount: z.number().optional(),
  isHelpful: z.boolean().optional(),
  createdAt: z.string(),
})

export const reviewDetailSchema = reviewSummarySchema.extend({
  clientProfile: clientProfileSchema.optional(),
  messages: z.array(snapshotMessageSchema).optional(),
  communicationMetrics: communicationMetricsSchema.optional(),
  expertReply: expertReplySchema.nullable().optional(),
})

export type SnapshotMessage = z.infer<typeof snapshotMessageSchema>
export type ReviewSummary = z.infer<typeof reviewSummarySchema>
export type ReviewDetail = z.infer<typeof reviewDetailSchema>
export type ExpertReply = z.infer<typeof expertReplySchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const submitRatingRequestSchema = z.object({
  rating: z.number().min(1).max(5),
})

export const createExpertReplyRequestSchema = z.object({
  content: z.string().min(1).max(500),
})

export const toggleMessageVisibilityRequestSchema = z.object({
  reason: visibilityReasonSchema,
})

export type SubmitRatingRequest = z.infer<typeof submitRatingRequestSchema>
export type CreateExpertReplyRequest = z.infer<typeof createExpertReplyRequestSchema>
export type ToggleMessageVisibilityRequest = z.infer<typeof toggleMessageVisibilityRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const reviewDetailResponseSchema = successResponseSchema(reviewDetailSchema)

export const reviewListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(reviewSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const myReviewSummarySchema = z.object({
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  ratingDistribution: z.record(z.string(), z.number()).optional(),
})

export const myReviewSummaryResponseSchema = successResponseSchema(myReviewSummarySchema)
