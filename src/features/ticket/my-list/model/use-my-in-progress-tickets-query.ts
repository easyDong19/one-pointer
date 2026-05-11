"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getMyInProgressTickets } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useMyInProgressTicketsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: ticketQueryKeys.myInProgress(),
    queryFn: ({ pageParam }) =>
      getMyInProgressTickets(pageParam ? { cursor: pageParam } : undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    enabled,
  })
}
