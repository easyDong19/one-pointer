import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ticketTypeSchema = z.enum(["OFFLINE", "ONLINE"])
export const ticketLevelSchema = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
export const ticketDurationSchema = z.enum([
  "THIRTY_MIN",
  "ONE_HOUR",
  "ONE_HALF_HOUR",
  "TWO_HOUR",
  "NEGOTIABLE",
])
export const estimatedDurationUnitSchema = z.enum(["MINUTE", "HOUR", "DAY", "WEEK", "MONTH"])
export const budgetTypeSchema = z.enum(["RANGE", "NEGOTIABLE"])
export const ticketStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "IN_REVIEW",
  "MATCHED",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
])
export const sourceTypeSchema = z.enum(["TICKET_FEED", "DIRECT_REQUEST"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** DesiredDateResponse */
export const desiredDateSchema = z.object({
  id: z.number(),
  date: z.string(),
  timeSlot: z.string(),
})

/** TicketImageResponse */
export const ticketImageSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  displayOrder: z.number(),
})

// ─── TicketResponse (상세) ──────────────────────────────────────────────────

/** TicketResponse */
export const ticketDetailSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  subCategoryId: z.number(),
  categoryName: z.string(),
  subCategoryName: z.string(),
  ticketType: ticketTypeSchema,
  title: z.string(),
  content: z.string(),
  level: ticketLevelSchema,
  desiredDuration: z.string(),
  estimatedDurationValue: z.number().nullable(),
  estimatedDurationUnit: estimatedDurationUnitSchema.nullable(),
  budgetType: budgetTypeSchema,
  budgetMin: z.number(),
  budgetMax: z.number(),
  region: z.string(),
  locationDetail: z.string().nullable(),
  deadline: z.string(),
  status: ticketStatusSchema,
  sourceType: sourceTypeSchema,
  targetExpertId: z.number().nullable(),
  matchedAt: z.string().nullable(),
  createdAt: z.string(),
  desiredDates: z.array(desiredDateSchema),
  images: z.array(ticketImageSchema),
  proposalCount: z.number(),
})

// Keep ticketSummarySchema as a FE convenience subset (used in list views)
export const ticketSummarySchema = ticketDetailSchema.pick({
  id: true,
  title: true,
  content: true,
  ticketType: true,
  status: true,
  level: true,
  budgetMin: true,
  budgetMax: true,
  budgetType: true,
  region: true,
  subCategoryId: true,
  subCategoryName: true,
  categoryName: true,
  createdAt: true,
}).partial({
  content: true,
  level: true,
  budgetMin: true,
  budgetMax: true,
  budgetType: true,
  region: true,
  subCategoryId: true,
  subCategoryName: true,
  categoryName: true,
})

export type TicketSummary = z.infer<typeof ticketSummarySchema>
export type TicketDetail = z.infer<typeof ticketDetailSchema>
export type TicketImage = z.infer<typeof ticketImageSchema>

// ─── MyTicketResponse ────────────────────────────────────────────────────────

/** MyTicketResponse */
export const myTicketSchema = z.object({
  id: z.number(),
  ticketType: ticketTypeSchema,
  subCategoryName: z.string(),
  title: z.string(),
  proposalCount: z.number(),
  status: ticketStatusSchema,
  createdAt: z.string(),
  thumbnailUrl: z.string().nullable(),
})

export type MyTicket = z.infer<typeof myTicketSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const createTicketRequestSchema = z.object({
  ticketType: ticketTypeSchema,
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  level: ticketLevelSchema,
  desiredDuration: ticketDurationSchema,
  budgetType: budgetTypeSchema,
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  locationDetail: z.string().nullable().optional(),
  subCategoryId: z.number(),
  targetExpertId: z.number().nullable().optional(),
  desiredDates: z.array(desiredDateSchema).optional(),
  directRequest: z.boolean().optional(),
})

export const updateTicketRequestSchema = z.object({
  ticketType: ticketTypeSchema.optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  level: ticketLevelSchema.optional(),
  desiredDuration: ticketDurationSchema.optional(),
  budgetType: budgetTypeSchema.optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  locationDetail: z.string().nullable().optional(),
  subCategoryId: z.number().optional(),
  desiredDates: z.array(desiredDateSchema).optional(),
})

export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>
export type UpdateTicketRequest = z.infer<typeof updateTicketRequestSchema>

// ─── Feed / Popular 전용 스키마 (TicketFeedResponse) ─────────────────────────

export const ticketFeedSortBySchema = z.enum(["LATEST", "BUDGET_HIGH", "DEADLINE_SOON"])
export type TicketFeedSortBy = z.infer<typeof ticketFeedSortBySchema>

/** TicketFeedResponse */
export const ticketFeedItemSchema = z.object({
  id: z.number(),
  majorCategoryName: z.string().nullable(),
  subCategoryName: z.string().nullable(),
  ticketType: ticketTypeSchema.nullable(),
  title: z.string().nullable(),
  budgetType: budgetTypeSchema.nullable(),
  budgetMin: z.number().nullable(),
  budgetMax: z.number().nullable(),
  desiredDuration: z.string().nullable(),
  region: z.string().nullable(),
  locationDetail: z.string().nullable(),
  createdAt: z.string().nullable(),
  proposalCount: z.number().nullable(),
  daysUntilDeadline: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  isNew: z.boolean().nullable(),
})

export type TicketFeedItem = z.infer<typeof ticketFeedItemSchema>

// ─── Feed Params ─────────────────────────────────────────────────────────────

export type TicketFeedParams = {
  majorCategoryId?: number
  subCategoryId?: number
  region?: string
  ticketType?: "OFFLINE" | "ONLINE"
  sortBy?: TicketFeedSortBy
  cursor?: string
  size?: number
}

export type TicketSearchParams = {
  keyword: string
  majorCategoryId?: number
  subCategoryId?: number
  region?: string
  ticketType?: "OFFLINE" | "ONLINE"
  sortBy?: TicketFeedSortBy
  cursor?: string
  size?: number
}

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const ticketDetailResponseSchema = successResponseSchema(ticketDetailSchema)

export const ticketListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myTicketSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const ticketFeedResponseSchema = successResponseSchema(
  z.object({
    content: z.array(ticketFeedItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const ticketSearchResponseSchema = successResponseSchema(
  z.object({
    content: z.array(ticketFeedItemSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const popularTicketListResponseSchema = successResponseSchema(
  z.array(ticketFeedItemSchema),
)

export type TicketDetailResponse = z.infer<typeof ticketDetailResponseSchema>
export type TicketListResponse = z.infer<typeof ticketListResponseSchema>
export type TicketFeedResponse = z.infer<typeof ticketFeedResponseSchema>
