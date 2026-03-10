import { serverFetch } from "@/shared/api/http/server-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  popularTicketListResponseSchema,
  type TicketFeedItem,
} from "./ticket.schema"

export type { TicketFeedItem }

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
