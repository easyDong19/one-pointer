import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createDisputeRequestSchema,
  respondDisputeRequestSchema,
  addEvidenceRequestSchema,
  disputeResponseSchema,
  disputeDetailResponseSchema,
  disputeListResponseSchema,
  eligibleTransactionListResponseSchema,
  type CreateDisputeRequest,
  type RespondDisputeRequest,
  type AddEvidenceRequest,
  type Dispute,
  type MyDisputeListItem,
  type MyDisputeDetail,
  type EligibleTransaction,
} from "./dispute.schema"

export type {
  CreateDisputeRequest,
  RespondDisputeRequest,
  AddEvidenceRequest,
  Dispute,
  MyDisputeListItem,
  MyDisputeDetail,
  EligibleTransaction,
}


export async function createDispute(input: CreateDisputeRequest): Promise<Dispute> {
  const path = "/v1/api/disputes"
  const method = "POST"
  const payload = parseSchemaOrThrow(createDisputeRequestSchema, input, {
    path,
    method,
    message: "Invalid create dispute request payload",
  })
  const response = await clientFetch<unknown, CreateDisputeRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(disputeResponseSchema, response, {
    path,
    method,
    message: "Invalid create dispute response payload",
  })
  return parsed.data
}

export async function respondToDispute(
  disputeId: number,
  input: RespondDisputeRequest,
): Promise<Dispute> {
  const path = `/v1/api/disputes/${disputeId}/respond`
  const method = "POST"
  const payload = parseSchemaOrThrow(respondDisputeRequestSchema, input, {
    path,
    method,
    message: "Invalid respond dispute request payload",
  })
  const response = await clientFetch<unknown, RespondDisputeRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(disputeResponseSchema, response, {
    path,
    method,
    message: "Invalid respond dispute response payload",
  })
  return parsed.data
}

export async function addDisputeEvidences(
  disputeId: number,
  input: AddEvidenceRequest,
): Promise<Dispute> {
  const path = `/v1/api/disputes/${disputeId}/evidences`
  const method = "POST"
  const payload = parseSchemaOrThrow(addEvidenceRequestSchema, input, {
    path,
    method,
    message: "Invalid add evidence request payload",
  })
  const response = await clientFetch<unknown, AddEvidenceRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(disputeResponseSchema, response, {
    path,
    method,
    message: "Invalid add evidence response payload",
  })
  return parsed.data
}

export async function cancelDispute(disputeId: number): Promise<Dispute> {
  const path = `/v1/api/disputes/${disputeId}/cancel`
  const method = "POST"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(disputeResponseSchema, response, {
    path,
    method,
    message: "Invalid cancel dispute response payload",
  })
  return parsed.data
}

export async function getDispute(disputeId: number): Promise<MyDisputeDetail> {
  const path = `/v1/api/disputes/${disputeId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(disputeDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid dispute detail response payload",
  })
  return parsed.data
}

export async function getMyDisputes(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyDisputeListItem[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/disputes/my"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(disputeListResponseSchema, response, {
    path,
    method,
    message: "Invalid my disputes response payload",
  })
  return parsed.data
}

export async function getEligibleDisputeTransactions(): Promise<EligibleTransaction[]> {
  const path = "/v1/api/disputes/eligible-transactions"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(eligibleTransactionListResponseSchema, response, {
    path,
    method,
    message: "Invalid eligible transactions response payload",
  })
  return parsed.data
}

export async function getDisputeByTicket(ticketId: number): Promise<Dispute> {
  const path = `/v1/api/disputes/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(disputeResponseSchema, response, {
    path,
    method,
    message: "Invalid dispute by ticket response payload",
  })
  return parsed.data
}
