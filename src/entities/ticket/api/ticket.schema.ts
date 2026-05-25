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

/** DesiredDateResponse — 응답에 id 포함.
 *
 * 실측: PUT/POST 응답에서 새로 생성된 행은 `id` 가 `null` 로 내려옴
 * (백엔드 직렬화 시점 이슈로 추정). GET 응답에선 정상 number.
 */
export const desiredDateSchema = z.object({
  id: z.number().nullable(),
  date: z.string(),
  timeSlot: z.string(),
})

/** DesiredDateRequest — 생성/수정 요청에는 id 없음 (서버 생성). docs/api/05-ticket.md */
export const desiredDateRequestSchema = z.object({
  date: z.string(),
  timeSlot: z.string(),
})

export type DesiredDateRequest = z.infer<typeof desiredDateRequestSchema>

/** TicketImageResponse.
 *
 * 실측: PUT/POST 응답에서 새로 생성된 row 의 `id` 가 `null` 로 내려옴.
 */
export const ticketImageSchema = z.object({
  id: z.number().nullable(),
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
  estimatedDurationValue: z.number().nullish(),
  estimatedDurationUnit: estimatedDurationUnitSchema.nullish(),
  budgetType: budgetTypeSchema,
  budgetMin: z.number().nullish(),
  budgetMax: z.number().nullish(),
  region: z.string().nullish(),
  locationDetail: z.string().nullish(),
  deadline: z.string(),
  status: ticketStatusSchema,
  sourceType: sourceTypeSchema,
  targetExpertId: z.number().nullish(),
  matchedAt: z.string().nullish(),
  createdAt: z.string(),
  desiredDates: z.array(desiredDateSchema),
  images: z.array(ticketImageSchema),
  proposalCount: z.number().nullish(),
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

export type TicketType = z.infer<typeof ticketTypeSchema>
export type TicketLevel = z.infer<typeof ticketLevelSchema>
export type TicketDuration = z.infer<typeof ticketDurationSchema>
export type BudgetType = z.infer<typeof budgetTypeSchema>
export type TicketStatus = z.infer<typeof ticketStatusSchema>
export type EstimatedDurationUnit = z.infer<typeof estimatedDurationUnitSchema>

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
  thumbnailUrl: z.string().nullish(),
})

export type MyTicket = z.infer<typeof myTicketSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

/**
 * 모바일 실측 (one-pointer-mobile/lib/model/ticket/request/CreateTicketRequest.dart) 기준:
 * - desiredDuration 필드는 요청에서 사용 안 함 (서버가 estimatedDuration 으로부터 계산)
 * - estimatedDurationValue + estimatedDurationUnit 으로 시간 표현
 * - imageUrls 로 첨부 이미지 (최대 3장)
 * - level / subCategoryId 도 nullable optional
 */
export const createTicketRequestSchema = z.object({
  ticketType: ticketTypeSchema,
  title: z.string().min(1, "제목을 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
  level: ticketLevelSchema.nullable().optional(),
  estimatedDurationValue: z.number().int().nullable().optional(),
  estimatedDurationUnit: estimatedDurationUnitSchema.nullable().optional(),
  budgetType: budgetTypeSchema.nullable().optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  locationDetail: z.string().nullable().optional(),
  subCategoryId: z.number().nullable().optional(),
  targetExpertId: z.number().nullable().optional(),
  desiredDates: z.array(desiredDateRequestSchema).nullable().optional(),
  imageUrls: z.array(z.string()).nullable().optional(),
  directRequest: z.boolean().optional(),
})

export const updateTicketRequestSchema = z.object({
  ticketType: ticketTypeSchema.optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  level: ticketLevelSchema.nullable().optional(),
  estimatedDurationValue: z.number().int().nullable().optional(),
  estimatedDurationUnit: estimatedDurationUnitSchema.nullable().optional(),
  budgetType: budgetTypeSchema.nullable().optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  region: z.string().nullable().optional(),
  locationDetail: z.string().nullable().optional(),
  subCategoryId: z.number().optional(),
  desiredDates: z.array(desiredDateRequestSchema).nullable().optional(),
  imageUrls: z.array(z.string()).nullable().optional(),
})

export type CreateTicketRequest = z.infer<typeof createTicketRequestSchema>
export type UpdateTicketRequest = z.infer<typeof updateTicketRequestSchema>

// ─── Feed / Popular 전용 스키마 (TicketFeedResponse) ─────────────────────────

export const ticketFeedSortBySchema = z.enum(["LATEST", "BUDGET_HIGH", "DEADLINE_SOON"])
export type TicketFeedSortBy = z.infer<typeof ticketFeedSortBySchema>

/** TicketFeedResponse */
export const ticketFeedItemSchema = z.object({
  id: z.number(),
  majorCategoryName: z.string().nullish(),
  subCategoryName: z.string().nullish(),
  ticketType: ticketTypeSchema.nullish(),
  title: z.string().nullish(),
  budgetType: budgetTypeSchema.nullish(),
  budgetMin: z.number().nullish(),
  budgetMax: z.number().nullish(),
  desiredDuration: z.string().nullish(),
  region: z.string().nullish(),
  locationDetail: z.string().nullish(),
  createdAt: z.string().nullish(),
  proposalCount: z.number().nullish(),
  daysUntilDeadline: z.number().nullish(),
  thumbnailUrl: z.string().nullish(),
  new: z.boolean().nullish(),
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
  z.array(ticketDetailSchema),
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

export const myTicketPaginatedResponseSchema = successResponseSchema(
  z.object({
    content: z.array(myTicketSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export type TicketDetailResponse = z.infer<typeof ticketDetailResponseSchema>
export type TicketListResponse = z.infer<typeof ticketListResponseSchema>
export type TicketFeedResponse = z.infer<typeof ticketFeedResponseSchema>
