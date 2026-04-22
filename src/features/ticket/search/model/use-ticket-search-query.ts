import { useInfiniteQuery } from "@tanstack/react-query"
import { searchTickets } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"
import type { TicketSearchParams } from "@/entities/ticket/api/ticket.schema"

/**
 * `GET /v1/api/ticket/search` 를 cursor 기반 무한 쿼리로 감싼 훅.
 *
 * - keyword 가 비어 있으면 쿼리가 비활성화된다 (API 호출 차단).
 * - 필터 파라미터(region/ticketType/sortBy 등)가 변경되면 쿼리 키가 달라져 자동 리패치.
 */
export function useTicketSearchQuery(params: TicketSearchParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: ticketQueryKeys.search(params),
    queryFn: ({ pageParam }) =>
      searchTickets({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled: enabled && params.keyword.trim().length > 0,
  })
}
