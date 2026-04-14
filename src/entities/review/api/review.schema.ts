import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const reviewStatusSchema = z.enum([
  "SNAPSHOT_CREATED",
  "FILTERING",
  "WAITING_RATING",
  "PUBLISHED",
  "PUBLISHED_NO_RATING",
  "HIDDEN",
])

export const messageVisibilitySchema = z.enum(["PUBLIC", "HIDDEN_BY_SENDER", "HIDDEN_BY_SYSTEM"])
export const visibilityReasonSchema = z.enum(["PERSONAL", "SENSITIVE", "OTHER"])
export const ticketTypeSchema = z.enum(["OFFLINE", "ONLINE"])
export const senderTypeSchema = z.enum(["CLIENT", "EXPERT", "SYSTEM"])
export const messageTypeSchema = z.enum(["TEXT", "IMAGE", "FILE", "SYSTEM", "AGREEMENT", "DELIVERY"])
export const callerTypeSchema = z.enum(["CLIENT", "EXPERT", "SYSTEM"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** CommunicationMetricsResponse */
export const communicationMetricsSchema = z.object({
  averageResponseMinutes: z.number(),
  totalMessageCount: z.number(),
  firstResponseMinutes: z.number(),
  // FE-only fields
  clientMessageCount: z.number().optional(),
  expertMessageCount: z.number().optional(),
  totalMessages: z.number().optional(),
  hiddenRatio: z.number().optional(),
})

/** ExpertReplyResponse */
export const expertReplySchema = z.object({
  content: z.string(),
  createdAt: z.string(),
  // FE-only fields
  id: z.number().optional(),
})

/** ClientProfileResponse */
export const clientProfileSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

/** ExpertProfileResponse */
export const expertProfileSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

/** MessagePreviewResponse */
export const messagePreviewSchema = z.object({
  senderType: senderTypeSchema,
  senderNickname: z.string(),
  messageType: messageTypeSchema,
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  visibility: messageVisibilitySchema,
})

/** SnapshotMessageResponse */
export const snapshotMessageSchema = z.object({
  messageId: z.number(),
  senderType: senderTypeSchema,
  senderNickname: z.string(),
  messageType: messageTypeSchema,
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  visibility: messageVisibilitySchema,
  sentAt: z.string(),
  // FE-only fields
  id: z.number().optional(),
  senderId: z.number().optional(),
})

/** FilteringMessageResponse */
export const filteringMessageSchema = z.object({
  messageId: z.number(),
  senderType: senderTypeSchema,
  senderNickname: z.string(),
  messageType: messageTypeSchema,
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  visibility: messageVisibilitySchema,
  sentAt: z.string(),
  sequence: z.number(),
  canToggle: z.boolean(),
  own: z.boolean(),
})

/** FilteringViewResponse */
export const filteringViewSchema = z.object({
  reviewId: z.number(),
  status: reviewStatusSchema,
  filteringDeadline: z.string(),
  myFilteringCompleted: z.boolean(),
  otherFilteringCompleted: z.boolean(),
  rating: z.number().nullable(),
  callerType: callerTypeSchema,
  totalMessageCount: z.number(),
  myMessageCount: z.number(),
  myHiddenCount: z.number(),
  messages: z.array(filteringMessageSchema),
})

/** ReviewDetailResponse */
export const reviewDetailSchema = z.object({
  reviewId: z.number(),
  rating: z.number().nullable(),
  publishedAt: z.string(),
  helpfulCount: z.number(),
  ticketType: ticketTypeSchema,
  ticketTitle: z.string(),
  clientProfile: clientProfileSchema,
  communicationMetrics: communicationMetricsSchema,
  messages: z.array(snapshotMessageSchema),
  expertReply: expertReplySchema.nullable(),
  // FE-only fields
  id: z.number().optional(),
  ticketId: z.number().optional(),
  expertProfileId: z.number().optional(),
  status: reviewStatusSchema.optional(),
  isHelpful: z.boolean().optional(),
  createdAt: z.string().optional(),
})

/** ReviewFeedResponse */
export const reviewFeedSchema = z.object({
  reviewId: z.number(),
  rating: z.number(),
  publishedAt: z.string(),
  helpfulCount: z.number(),
  ticketType: ticketTypeSchema,
  ticketTitle: z.string(),
  clientProfile: clientProfileSchema,
  communicationMetrics: communicationMetricsSchema,
  messagePreview: z.array(messagePreviewSchema),
  totalPublicMessageCount: z.number(),
  expertReply: expertReplySchema.nullable(),
})

/** MyReviewResponse */
export const myReviewSchema = z.object({
  reviewId: z.number(),
  rating: z.number().nullable(),
  status: reviewStatusSchema,
  publishedAt: z.string(),
  helpfulCount: z.number(),
  ticketType: ticketTypeSchema,
  ticketTitle: z.string(),
  expertProfile: expertProfileSchema,
  communicationMetrics: communicationMetricsSchema,
  messagePreview: z.array(messagePreviewSchema),
  totalPublicMessageCount: z.number(),
  expertReply: expertReplySchema.nullable(),
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

export type SnapshotMessage = z.infer<typeof snapshotMessageSchema>
export type ReviewSummary = z.infer<typeof reviewSummarySchema>
export type ReviewDetail = z.infer<typeof reviewDetailSchema>
export type ExpertReply = z.infer<typeof expertReplySchema>
export type MessagePreview = z.infer<typeof messagePreviewSchema>
export type FilteringMessage = z.infer<typeof filteringMessageSchema>
export type FilteringView = z.infer<typeof filteringViewSchema>
export type ReviewFeed = z.infer<typeof reviewFeedSchema>
export type MyReview = z.infer<typeof myReviewSchema>

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

export const reviewFeedListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(reviewFeedSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const myReviewListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myReviewSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const filteringViewResponseSchema = successResponseSchema(filteringViewSchema)

export const myReviewSummarySchema = z.object({
  averageRating: z.number().nullable(),
  reviewCount: z.number(),
  ratingDistribution: z.record(z.string(), z.number()).optional(),
})

export const myReviewSummaryResponseSchema = successResponseSchema(myReviewSummarySchema)
