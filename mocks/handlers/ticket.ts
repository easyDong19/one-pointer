import { http, HttpResponse, type RequestHandler } from "msw"
import { bannerListResponseSchema } from "@/entities/banner/api/banner.schema"
import { inquiryResponseSchema } from "@/entities/inquiry/api/inquiry.schema"
import {
  acceptProposalResponseSchema,
  myProposalDetailResponseSchema,
  myProposalListResponseSchema,
  proposalDetailResponseSchema,
  proposalsByTicketResponseSchema,
} from "@/entities/proposal/api/proposal.schema"
import {
  myTicketPaginatedResponseSchema,
  popularTicketListResponseSchema,
  ticketDetailResponseSchema,
  ticketFeedResponseSchema,
  ticketListResponseSchema,
  ticketSearchResponseSchema,
} from "@/entities/ticket/api/ticket.schema"
import {
  chatRoomIdForProposal,
  createdProposal,
  findMyProposalDetail,
  findProposalDetail,
  myCompletedProposals,
  myInProgressProposals,
  proposalsByTicket,
} from "../fixtures/proposal"
import {
  BANNERS,
  createdTicket,
  findTicketDetail,
  myCompletedTickets,
  myInProgressTickets,
  myRecruitingTickets,
  popularTickets,
  queryFeed,
  receivedDirectRequests,
  sentDirectRequests,
  updatedTicket,
  type FeedQuery,
} from "../fixtures/ticket"
import { apiPath, mock, mockOk } from "../lib/respond"
import { localDateTime } from "../lib/time"
import { ME } from "../world"

/**
 * ticket · proposal · banner · inquiry 도메인 목업.
 *
 * 순서 주의: 고정 경로(`/ticket/my`, `/ticket/feed` …) 를 파라미터 경로(`/ticket/:ticketId`) 보다
 * 먼저 등록한다. 존재하지 않는 ID 는 앞단 가드 핸들러가 404 를 돌려준다.
 */

const notFound = (message: string) =>
  HttpResponse.json({ success: false, message, data: null }, { status: 404 })

const page = <T>(content: T[]) => ({ content, nextCursor: null, hasNext: false })

const num = (value: string | null): number | null => {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function feedQuery(request: Request): FeedQuery {
  const params = new URL(request.url).searchParams
  return {
    keyword: params.get("keyword"),
    majorCategoryId: num(params.get("majorCategoryId")),
    subCategoryId: num(params.get("subCategoryId")),
    region: params.get("region"),
    ticketType: params.get("ticketType"),
    sortBy: params.get("sortBy"),
  }
}

async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

// ─── Ticket ──────────────────────────────────────────────────────────────────

const ticketHandlers = [
  // 생성
  mock("post", "/v1/api/ticket", ticketDetailResponseSchema, async ({ request }) =>
    createdTicket(await jsonBody(request)),
  ),

  // 목록 (고정 경로)
  mock("get", "/v1/api/ticket/popular", popularTicketListResponseSchema, () => popularTickets()),
  mock("get", "/v1/api/ticket/feed", ticketFeedResponseSchema, ({ request }) =>
    page(queryFeed(feedQuery(request))),
  ),
  mock("get", "/v1/api/ticket/search", ticketSearchResponseSchema, ({ request }) =>
    page(queryFeed(feedQuery(request))),
  ),
  mock("get", "/v1/api/ticket/my/in-progress", myTicketPaginatedResponseSchema, () =>
    page(myInProgressTickets()),
  ),
  mock("get", "/v1/api/ticket/my/completed", myTicketPaginatedResponseSchema, () =>
    page(myCompletedTickets()),
  ),
  mock("get", "/v1/api/ticket/my", ticketListResponseSchema, () => myRecruitingTickets()),
  mock("get", "/v1/api/ticket/direct-request/sent", myTicketPaginatedResponseSchema, () =>
    page(sentDirectRequests()),
  ),
  mock("get", "/v1/api/ticket/direct-request/received", myTicketPaginatedResponseSchema, () =>
    page(receivedDirectRequests()),
  ),

  // 제안 수락 → 채팅방 생성
  mock(
    "post",
    "/v1/api/ticket/proposal/:proposalId/accept",
    acceptProposalResponseSchema,
    ({ params }) => ({ chatRoomId: chatRoomIdForProposal(Number(params.proposalId)) }),
  ),

  // 상태 전이 mutation
  mockOk("post", "/v1/api/ticket/:ticketId/complete", true),
  mockOk("post", "/v1/api/ticket/:ticketId/cancel", true),
  mockOk("post", "/v1/api/ticket/:ticketId/direct-request/reject", true),
  mock("post", "/v1/api/ticket/:ticketId/reupload", ticketDetailResponseSchema, ({ params }) => ({
    ...updatedTicket(Number(params.ticketId), {}),
    status: "OPEN" as const,
    createdAt: localDateTime(0),
  })),

  // 상세 / 수정 (파라미터 경로 — 마지막)
  http.get(apiPath("/v1/api/ticket/:ticketId"), ({ params }) =>
    findTicketDetail(Number(params.ticketId)) ? undefined : notFound("존재하지 않는 의뢰입니다."),
  ),
  mock(
    "get",
    "/v1/api/ticket/:ticketId",
    ticketDetailResponseSchema,
    ({ params }) => findTicketDetail(Number(params.ticketId))!,
  ),
  mock("put", "/v1/api/ticket/:ticketId", ticketDetailResponseSchema, async ({ params, request }) =>
    updatedTicket(Number(params.ticketId), await jsonBody(request)),
  ),
]

// ─── Proposal ────────────────────────────────────────────────────────────────

const proposalHandlers = [
  mock("post", "/v1/api/proposal", proposalDetailResponseSchema, async ({ request }) =>
    createdProposal(await jsonBody(request)),
  ),

  mock("get", "/v1/api/proposal/my/in-progress", myProposalListResponseSchema, () =>
    page(myInProgressProposals()),
  ),
  mock("get", "/v1/api/proposal/my/completed", myProposalListResponseSchema, () =>
    page(myCompletedProposals()),
  ),
  http.get(apiPath("/v1/api/proposal/my/:proposalId"), ({ params }) =>
    findMyProposalDetail(Number(params.proposalId))
      ? undefined
      : notFound("존재하지 않는 제안서입니다."),
  ),
  mock(
    "get",
    "/v1/api/proposal/my/:proposalId",
    myProposalDetailResponseSchema,
    ({ params }) => findMyProposalDetail(Number(params.proposalId))!,
  ),

  mock("get", "/v1/api/proposal/ticket/:ticketId", proposalsByTicketResponseSchema, ({ params }) =>
    proposalsByTicket(Number(params.ticketId)),
  ),

  mockOk("post", "/v1/api/proposal/:proposalId/withdraw", true),

  http.get(apiPath("/v1/api/proposal/:proposalId"), ({ params }) =>
    findProposalDetail(Number(params.proposalId))
      ? undefined
      : notFound("존재하지 않는 제안서입니다."),
  ),
  mock(
    "get",
    "/v1/api/proposal/:proposalId",
    proposalDetailResponseSchema,
    ({ params }) => findProposalDetail(Number(params.proposalId))!,
  ),
]

// ─── Banner / Inquiry ────────────────────────────────────────────────────────

const etcHandlers = [
  // `?platform=WEB` 쿼리는 경로 매칭에 영향 없음
  mock("get", "/v1/api/banner", bannerListResponseSchema, () => BANNERS),

  mock("post", "/v1/api/inquiry", inquiryResponseSchema, async ({ request }) => {
    const body = await jsonBody(request)
    return {
      id: 9001,
      contactEmail: typeof body.contactEmail === "string" ? body.contactEmail : ME.email,
      status: "PENDING" as const,
      createDateTime: localDateTime(0),
    }
  }),
]

export const ticketGroupHandlers: RequestHandler[] = [
  ...ticketHandlers,
  ...proposalHandlers,
  ...etcHandlers,
]
