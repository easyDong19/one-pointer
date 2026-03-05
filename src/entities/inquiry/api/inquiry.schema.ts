import { z } from "zod/v4"

export const createInquiryRequestSchema = z.object({
  contactEmail: z.string().email("유효한 이메일 형식이 아닙니다."),
  content: z.string().min(1, "문의 내용을 입력해주세요."),
  imageUrls: z.array(z.string()).optional(),
})

export type CreateInquiryRequest = z.infer<typeof createInquiryRequestSchema>

