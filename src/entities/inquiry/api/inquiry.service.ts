import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createInquiryRequestSchema,
  type CreateInquiryRequest,
} from "./inquiry.schema"

export type { CreateInquiryRequest }

export async function createInquiry(input: CreateInquiryRequest): Promise<void> {
  const path = "/v1/api/inquiry"
  const method = "POST"
  const payload = parseSchemaOrThrow(createInquiryRequestSchema, input, {
    path,
    method,
    message: "Invalid inquiry request payload",
  })
  await clientFetch<unknown, CreateInquiryRequest>({ path, method, body: payload })
}
