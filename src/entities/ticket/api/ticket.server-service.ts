import { serverFetch } from "@/shared/api/http/server-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  popularTicketListResponseSchema,
  ticketDetailResponseSchema,
  type TicketFeedItem,
  type TicketDetail,
} from "./ticket.schema"

export type { TicketFeedItem, TicketDetail }

/**
 * 서버 컴포넌트 전용: 인기 의뢰 목록 조회 (인증 불필요)
 * 제안서 수가 많은 상위 20건 반환
 */
export async function getPopularTicketsOnServer(): Promise<TicketFeedItem[]> {
  const path = "/v1/api/ticket/popular"
  const method = "GET"
  const response = await serverFetch<unknown>({
    path,
    method,
    forwardCookies: false,
    skipAuthRefresh: true,
    revalidate: 300, // 5분 캐시
  })
  const parsed = parseSchemaOrThrow(popularTicketListResponseSchema, response, {
    path,
    method,
    message: "Invalid popular tickets response payload",
  })
  return parsed.data
}

/**
 * 서버 컴포넌트 전용: 의뢰 상세 조회 (공개 — 인증 불필요).
 * 의뢰 열람은 누구나 가능하므로 익명으로 조회한다 (만료 토큰 사용자도 열람 가능).
 * 클라이언트 `useTicketDetailQuery` 와 동일한 응답 형태(TicketDetail)를 반환해 hydration 에 사용.
 */
export async function getTicketDetailOnServer(id: number): Promise<TicketDetail> {
  const path = `/v1/api/ticket/${id}`
  const method = "GET"
  const response = await serverFetch<unknown>({
    path,
    method,
    forwardCookies: false,
    skipAuthRefresh: true,
    revalidate: 60, // 상태가 바뀔 수 있어 짧게 캐시 (클라이언트가 마운트 후 최신화)
  })
  const parsed = parseSchemaOrThrow(ticketDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid ticket detail response payload",
  })
  return parsed.data
}
