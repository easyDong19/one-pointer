import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  createTicketRequestSchema,
  updateTicketRequestSchema,
  ticketDetailResponseSchema,
  ticketListResponseSchema,
  ticketFeedResponseSchema,
  ticketSearchResponseSchema,
  popularTicketListResponseSchema,
  type CreateTicketRequest,
  type UpdateTicketRequest,
  type TicketDetail,
  type TicketSummary,
  type MyTicket,
  type TicketFeedItem,
  type TicketFeedParams,
  type TicketSearchParams,
} from "./ticket.schema"

export type { CreateTicketRequest, UpdateTicketRequest, TicketDetail, TicketSummary, MyTicket, TicketFeedItem, TicketFeedParams, TicketSearchParams }


// ─── Ticket CRUD ──────────────────────────────────────────────────────────────

export async function createTicket(input: CreateTicketRequest): Promise<TicketDetail> {
  const path = "/v1/api/ticket"
  const method = "POST"
  const payload = parseSchemaOrThrow(createTicketRequestSchema, input, {
    path,
    method,
    message: "Invalid create ticket request payload",
  })
  const response = await clientFetch<unknown, CreateTicketRequest>({ path, method, body: payload })
  const parsed = parseSchemaOrThrow(ticketDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid create ticket response payload",
  })
  return parsed.data
}

export async function updateTicket(
  ticketId: number,
  input: UpdateTicketRequest,
): Promise<TicketDetail> {
  const path = `/v1/api/ticket/${ticketId}`
  const method = "PUT"
  const payload = parseSchemaOrThrow(updateTicketRequestSchema, input, {
    path,
    method,
    message: "Invalid update ticket request payload",
  })
  const response = await clientFetch<unknown, UpdateTicketRequest>({ path, method, body: payload })
  const parsed = parseSchemaOrThrow(ticketDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid update ticket response payload",
  })
  return parsed.data
}

export async function getTicket(id: number): Promise<TicketDetail> {
  const path = `/v1/api/ticket/${id}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(ticketDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid ticket detail response payload",
  })
  return parsed.data
}

export async function completeOfflineTicket(ticketId: number): Promise<void> {
  const path = `/v1/api/ticket/${ticketId}/complete`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

export async function cancelTicket(ticketId: number): Promise<void> {
  const path = `/v1/api/ticket/${ticketId}/cancel`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

export async function acceptProposal(proposalId: number): Promise<void> {
  const path = `/v1/api/ticket/proposal/${proposalId}/accept`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

// ─── Popular Tickets ─────────────────────────────────────────────────────────

export async function getPopularTickets(): Promise<TicketFeedItem[]> {
  const path = "/v1/api/ticket/popular"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(popularTicketListResponseSchema, response, {
    path,
    method,
    message: "Invalid popular tickets response payload",
  })
  return parsed.data
}

// ─── Ticket Feed & Search ─────────────────────────────────────────────────────

export async function getTicketFeed(
  params?: TicketFeedParams,
): Promise<{ content: TicketFeedItem[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/feed"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketFeedResponseSchema, response, {
    path,
    method,
    message: "Invalid ticket feed response payload",
  })
  return parsed.data
}

export async function searchTickets(
  params: TicketSearchParams,
): Promise<{ content: TicketFeedItem[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/search"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketSearchResponseSchema, response, {
    path,
    method,
    message: "Invalid ticket search response payload",
  })
  return parsed.data
}

// ─── My Tickets ───────────────────────────────────────────────────────────────

export async function getMyTickets(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyTicket[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/my"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketListResponseSchema, response, {
    path,
    method,
    message: "Invalid my tickets response payload",
  })
  return parsed.data
}

export async function getMyInProgressTickets(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyTicket[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/my/in-progress"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketListResponseSchema, response, {
    path,
    method,
    message: "Invalid my in-progress tickets response payload",
  })
  return parsed.data
}

export async function getMyCompletedTickets(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyTicket[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/my/completed"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketListResponseSchema, response, {
    path,
    method,
    message: "Invalid my completed tickets response payload",
  })
  return parsed.data
}

// ─── Direct Request ───────────────────────────────────────────────────────────

export async function getSentDirectRequests(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyTicket[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/direct-request/sent"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketListResponseSchema, response, {
    path,
    method,
    message: "Invalid sent direct requests response payload",
  })
  return parsed.data
}

export async function getReceivedDirectRequests(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: MyTicket[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/ticket/direct-request/received"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(ticketListResponseSchema, response, {
    path,
    method,
    message: "Invalid received direct requests response payload",
  })
  return parsed.data
}

export async function reuploadTicket(ticketId: number): Promise<TicketDetail> {
  const path = `/v1/api/ticket/${ticketId}/reupload`
  const method = "POST"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(ticketDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid reupload ticket response payload",
  })
  return parsed.data
}

export async function rejectDirectRequest(ticketId: number): Promise<void> {
  const path = `/v1/api/ticket/${ticketId}/direct-request/reject`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}
