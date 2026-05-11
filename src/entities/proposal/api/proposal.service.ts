import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createProposalRequestSchema,
  myProposalDetailResponseSchema,
  myProposalListResponseSchema,
  proposalDetailResponseSchema,
  proposalsByTicketResponseSchema,
  type CreateProposalRequest,
  type MyProposal,
  type MyProposalDetail,
  type ProposalDetail,
  type ProposalSummary,
} from "./proposal.schema"

export type { CreateProposalRequest, ProposalDetail, ProposalSummary, MyProposal, MyProposalDetail }

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
): Promise<ProposalSummary[]> {
  const path = `/v1/api/proposal/ticket/${ticketId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(proposalsByTicketResponseSchema, response, {
    path,
    method,
    message: "Invalid proposals by ticket response payload",
  })
  return parsed.data
}

export async function getMyProposal(id: number): Promise<MyProposalDetail> {
  const path = `/v1/api/proposal/my/${id}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(myProposalDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid my proposal detail response payload",
  })
  return parsed.data
}

type MyProposalListPage = {
  content: MyProposal[]
  nextCursor?: string | number | null
  hasNext?: boolean | null
}

export async function getMyInProgressProposals(params?: {
  cursor?: string | number
  size?: number
}): Promise<MyProposalListPage> {
  const path = "/v1/api/proposal/my/in-progress"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(myProposalListResponseSchema, response, {
    path,
    method,
    message: "Invalid my in-progress proposals response payload",
  })
  return parsed.data
}

export async function getMyCompletedProposals(params?: {
  cursor?: string | number
  size?: number
}): Promise<MyProposalListPage> {
  const path = "/v1/api/proposal/my/completed"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(myProposalListResponseSchema, response, {
    path,
    method,
    message: "Invalid my completed proposals response payload",
  })
  return parsed.data
}
