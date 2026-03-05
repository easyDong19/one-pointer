import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createAgreementRequestSchema,
  reproposeAgreementRequestSchema,
  updateAgreementDeadlineRequestSchema,
  agreementResponseSchema,
  type CreateAgreementRequest,
  type ReproposeAgreementRequest,
  type UpdateAgreementDeadlineRequest,
  type Agreement,
} from "./agreement.schema"

export type {
  CreateAgreementRequest,
  ReproposeAgreementRequest,
  UpdateAgreementDeadlineRequest,
  Agreement,
}


export async function createAgreement(input: CreateAgreementRequest): Promise<Agreement> {
  const path = "/v1/api/agreement"
  const method = "POST"
  const payload = parseSchemaOrThrow(createAgreementRequestSchema, input, {
    path,
    method,
    message: "Invalid create agreement request payload",
  })
  const response = await clientFetch<unknown, CreateAgreementRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid create agreement response payload",
  })
  return parsed.data
}

export async function reproposeAgreement(
  id: number,
  input: ReproposeAgreementRequest,
): Promise<Agreement> {
  const path = `/v1/api/agreement/${id}/repropose`
  const method = "PUT"
  const payload = parseSchemaOrThrow(reproposeAgreementRequestSchema, input, {
    path,
    method,
    message: "Invalid repropose agreement request payload",
  })
  const response = await clientFetch<unknown, ReproposeAgreementRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid repropose agreement response payload",
  })
  return parsed.data
}

export async function rejectAgreement(id: number): Promise<Agreement> {
  const path = `/v1/api/agreement/${id}/reject`
  const method = "POST"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid reject agreement response payload",
  })
  return parsed.data
}

export async function confirmAgreement(id: number): Promise<Agreement> {
  const path = `/v1/api/agreement/${id}/confirm`
  const method = "POST"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid confirm agreement response payload",
  })
  return parsed.data
}

export async function updateAgreementDeadline(
  id: number,
  input: UpdateAgreementDeadlineRequest,
): Promise<Agreement> {
  const path = `/v1/api/agreement/${id}/deadline`
  const method = "PATCH"
  const payload = parseSchemaOrThrow(updateAgreementDeadlineRequestSchema, input, {
    path,
    method,
    message: "Invalid update agreement deadline request payload",
  })
  const response = await clientFetch<unknown, UpdateAgreementDeadlineRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid update agreement deadline response payload",
  })
  return parsed.data
}

export async function getAgreementByTicket(ticketId: number): Promise<Agreement> {
  const path = `/v1/api/agreement/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(agreementResponseSchema, response, {
    path,
    method,
    message: "Invalid agreement by ticket response payload",
  })
  return parsed.data
}
