import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createProposalRequestSchema,
  proposalDetailResponseSchema,
  proposalListResponseSchema,
  type CreateProposalRequest,
  type ProposalDetail,
  type ProposalSummary,
} from "./proposal.schema"

export type { CreateProposalRequest, ProposalDetail, ProposalSummary }


export async function createProposal(input: CreateProposalRequest): Promise<ProposalDetail> {
  const path = "/v1/api/proposal"
  const method = "POST"
  const payload = parseSchemaOrThrow(createProposalRequestSchema, input, {
    path,
    method,
    message: "Invalid create proposal request payload",
  })
  const response = await clientFetch<unknown, CreateProposalRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(proposalDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid create proposal response payload",
  })
  return parsed.data
}

export async function withdrawProposal(id: number): Promise<void> {
  const path = `/v1/api/proposal/${id}/withdraw`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

export async function getProposal(id: number): Promise<ProposalDetail> {
  const path = `/v1/api/proposal/${id}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(proposalDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid proposal detail response payload",
  })
  return parsed.data
}

export async function getProposalsByTicket(
  ticketId: number,
  params?: { cursor?: string; size?: number },
): Promise<{ content: ProposalSummary[]; nextCursor: string | null; hasNext: boolean }> {
  const path = `/v1/api/proposal/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(proposalListResponseSchema, response, {
    path,
    method,
    message: "Invalid proposals by ticket response payload",
  })
  return parsed.data
}

export async function getMyProposal(id: number): Promise<ProposalDetail> {
  const path = `/v1/api/proposal/my/${id}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(proposalDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid my proposal detail response payload",
  })
  return parsed.data
}

export async function getMyInProgressProposals(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: ProposalSummary[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/proposal/my/in-progress"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(proposalListResponseSchema, response, {
    path,
    method,
    message: "Invalid my in-progress proposals response payload",
  })
  return parsed.data
}

export async function getMyCompletedProposals(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: ProposalSummary[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/proposal/my/completed"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(proposalListResponseSchema, response, {
    path,
    method,
    message: "Invalid my completed proposals response payload",
  })
  return parsed.data
}
