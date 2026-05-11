"use client"

import { useQuery } from "@tanstack/react-query"

import { getMyTickets } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useMyTicketsQuery(enabled = true) {
  return useQuery({
    queryKey: ticketQueryKeys.my(),
    queryFn: getMyTickets,
    enabled,
  })
}
