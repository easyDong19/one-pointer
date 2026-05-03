import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  escrowPaymentRequestSchema,
  escrowPaymentResponseSchema,
  escrowRefundResponseSchema,
  refundRequestSchema,
  refundRespondRequestSchema,
  type EscrowPaymentRequest,
  type EscrowPayment,
  type EscrowRefund,
  type EscrowRefundZone,
  type EscrowRefundStatus,
  type RefundRequest,
  type RefundRespondRequest,
} from "./payment.schema"

export type {
  EscrowPaymentRequest,
  EscrowPayment,
  EscrowRefund,
  EscrowRefundZone,
  EscrowRefundStatus,
  RefundRequest,
  RefundRespondRequest,
}


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

// ─── Refund ──────────────────────────────────────────────────────────────────

export async function requestRefund(input: RefundRequest): Promise<EscrowRefund> {
  const path = "/v1/api/payment/escrow/refund"
  const method = "POST"
  const payload = parseSchemaOrThrow(refundRequestSchema, input, {
    path,
    method,
    message: "Invalid refund request payload",
  })
  const response = await clientFetch<unknown, RefundRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(escrowRefundResponseSchema, response, {
    path,
    method,
    message: "Invalid refund response payload",
  })
  return parsed.data
}

export async function respondToRefund(
  refundRequestId: number,
  input: RefundRespondRequest,
): Promise<EscrowRefund> {
  const path = `/v1/api/payment/escrow/refund/${refundRequestId}/respond`
  const method = "POST"
  const payload = parseSchemaOrThrow(refundRespondRequestSchema, input, {
    path,
    method,
    message: "Invalid refund respond request payload",
  })
  const response = await clientFetch<unknown, RefundRespondRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(escrowRefundResponseSchema, response, {
    path,
    method,
    message: "Invalid refund respond response payload",
  })
  return parsed.data
}

export async function getRefundByTicket(ticketId: number): Promise<EscrowRefund> {
  const path = `/v1/api/payment/escrow/refund/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(escrowRefundResponseSchema, response, {
    path,
    method,
    message: "Invalid refund by ticket response payload",
  })
  return parsed.data
}
