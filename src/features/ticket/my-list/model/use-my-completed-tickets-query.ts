"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getMyCompletedTickets } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useMyCompletedTicketsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: ticketQueryKeys.myCompleted(),
    queryFn: ({ pageParam }) =>
      getMyCompletedTickets(pageParam ? { cursor: pageParam } : undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    enabled,
  })
}
