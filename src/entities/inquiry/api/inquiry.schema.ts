import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const inquiryStatusSchema = z.enum(["PENDING", "COMPLETED"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** InquiryResponse */
export const inquirySchema = z.object({
  id: z.number(),
  contactEmail: z.string(),
  status: inquiryStatusSchema,
  createDateTime: z.string(),
})

export type Inquiry = z.infer<typeof inquirySchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const createInquiryRequestSchema = z.object({
  contactEmail: z.string().email("유효한 이메일 형식이 아닙니다."),
  content: z.string().min(1, "문의 내용을 입력해주세요."),
  imageUrls: z.array(z.string()).optional(),
})

export type CreateInquiryRequest = z.infer<typeof createInquiryRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const inquiryResponseSchema = successResponseSchema(inquirySchema)

export const inquiryListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(inquirySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)
