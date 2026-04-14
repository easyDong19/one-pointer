import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  submitDeliveryRequestSchema,
  requestRevisionRequestSchema,
  resubmitDeliveryRequestSchema,
  rejectDeliveryRequestSchema,
  deliveryResponseSchema,
  type SubmitDeliveryRequest,
  type RequestRevisionRequest,
  type ResubmitDeliveryRequest,
  type RejectDeliveryRequest,
  type Delivery,
} from "./delivery.schema"

export type { SubmitDeliveryRequest, RequestRevisionRequest, ResubmitDeliveryRequest, RejectDeliveryRequest, Delivery }


export async function submitDelivery(input: SubmitDeliveryRequest): Promise<Delivery> {
  const path = "/v1/api/delivery"
  const method = "POST"
  const payload = parseSchemaOrThrow(submitDeliveryRequestSchema, input, {
    path,
    method,
    message: "Invalid submit delivery request payload",
  })
  const response = await clientFetch<unknown, SubmitDeliveryRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(deliveryResponseSchema, response, {
    path,
    method,
    message: "Invalid submit delivery response payload",
  })
  return parsed.data
}

export async function requestRevision(
  deliveryId: number,
  input: RequestRevisionRequest,
): Promise<Delivery> {
  const path = `/v1/api/delivery/${deliveryId}/revision`
  const method = "POST"
  const payload = parseSchemaOrThrow(requestRevisionRequestSchema, input, {
    path,
    method,
    message: "Invalid request revision payload",
  })
  const response = await clientFetch<unknown, RequestRevisionRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(deliveryResponseSchema, response, {
    path,
    method,
    message: "Invalid request revision response payload",
  })
  return parsed.data
}

export async function resubmitDelivery(
  deliveryId: number,
  input: ResubmitDeliveryRequest,
): Promise<Delivery> {
  const path = `/v1/api/delivery/${deliveryId}/resubmit`
  const method = "POST"
  const payload = parseSchemaOrThrow(resubmitDeliveryRequestSchema, input, {
    path,
    method,
    message: "Invalid resubmit delivery request payload",
  })
  const response = await clientFetch<unknown, ResubmitDeliveryRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(deliveryResponseSchema, response, {
    path,
    method,
    message: "Invalid resubmit delivery response payload",
  })
  return parsed.data
}

export async function approveDelivery(deliveryId: number): Promise<Delivery> {
  const path = `/v1/api/delivery/${deliveryId}/approve`
  const method = "POST"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(deliveryResponseSchema, response, {
    path,
    method,
    message: "Invalid approve delivery response payload",
  })
  return parsed.data
}

export async function getDeliveryByTicket(ticketId: number): Promise<Delivery> {
  const path = `/v1/api/delivery/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(deliveryResponseSchema, response, {
    path,
    method,
    message: "Invalid delivery by ticket response payload",
  })
  return parsed.data
}

export async function rejectDelivery(
  deliveryId: number,
  input: RejectDeliveryRequest,
): Promise<void> {
  const path = `/v1/api/delivery/${deliveryId}/reject`
  const method = "POST"
  const payload = parseSchemaOrThrow(rejectDeliveryRequestSchema, input, {
    path,
    method,
    message: "Invalid reject delivery request payload",
  })
  await clientFetch<unknown, RejectDeliveryRequest>({
    path,
    method,
    body: payload,
  })
}
