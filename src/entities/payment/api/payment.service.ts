import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  escrowPaymentRequestSchema,
  escrowPaymentResponseSchema,
  type EscrowPaymentRequest,
  type EscrowPayment,
} from "./payment.schema"

export type { EscrowPaymentRequest, EscrowPayment }


export async function payEscrow(input: EscrowPaymentRequest): Promise<EscrowPayment> {
  const path = "/v1/api/payment/escrow"
  const method = "POST"
  const payload = parseSchemaOrThrow(escrowPaymentRequestSchema, input, {
    path,
    method,
    message: "Invalid escrow payment request payload",
  })
  const response = await clientFetch<unknown, EscrowPaymentRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(escrowPaymentResponseSchema, response, {
    path,
    method,
    message: "Invalid escrow payment response payload",
  })
  return parsed.data
}

export async function getEscrowPaymentByTicket(ticketId: number): Promise<EscrowPayment> {
  const path = `/v1/api/payment/escrow/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(escrowPaymentResponseSchema, response, {
    path,
    method,
    message: "Invalid escrow payment by ticket response payload",
  })
  return parsed.data
}
