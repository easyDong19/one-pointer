"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getReceivedDirectRequests } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useReceivedDirectRequestsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: ticketQueryKeys.directRequestReceived(),
    queryFn: ({ pageParam }) =>
      getReceivedDirectRequests(pageParam ? { cursor: pageParam } : undefined),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : undefined),
    enabled,
  })
}
