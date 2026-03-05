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

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const desiredDateSchema = z.object({
  date: z.string(),
  timeSlot: z.string(),
})

export const ticketSummarySchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string().optional(),
  ticketType: ticketTypeSchema,
  status: ticketStatusSchema,
  level: ticketLevelSchema.optional(),
  budgetMin: z.number().nullable().optional(),
  budgetMax: z.number().nullable().optional(),
  budgetType: budgetTypeSchema.optional(),
  region: z.string().nullable().optional(),
  subCategoryId: z.number().optional(),
  subCategoryName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  directRequest: z.boolean().optional(),
})

export const ticketDetailSchema = ticketSummarySchema.extend({
  desiredDuration: ticketDurationSchema.optional(),
  locationDetail: z.string().nullable().optional(),
  desiredDates: z.array(desiredDateSchema).optional(),
  targetExpertId: z.number().nullable().optional(),
  proposalCount: z.number().optional(),
  clientId: z.number().optional(),
  clientNickname: z.string().optional(),
  clientProfileImageUrl: z.string().url().nullable().optional(),
})

export type TicketSummary = z.infer<typeof ticketSummarySchema>
export type TicketDetail = z.infer<typeof ticketDetailSchema>

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
    content: z.array(ticketSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const ticketSearchResponseSchema = successResponseSchema(
  z.object({
    content: z.array(ticketSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export type TicketDetailResponse = z.infer<typeof ticketDetailResponseSchema>
export type TicketListResponse = z.infer<typeof ticketListResponseSchema>
