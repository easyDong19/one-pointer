import { useInfiniteQuery } from "@tanstack/react-query"
import { getTicketFeed } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"
import type { TicketFeedParams } from "@/entities/ticket/api/ticket.schema"

export function useTicketFeedQuery(params: TicketFeedParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: ticketQueryKeys.feed(params),
    queryFn: ({ pageParam }) =>
      getTicketFeed({ ...params, cursor: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled,
  })
}
