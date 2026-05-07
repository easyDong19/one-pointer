"use client"

import { useQuery } from "@tanstack/react-query"

import { getDeliveryByTicket } from "@/entities/delivery/api/delivery.service"
import { deliveryQueryKeys } from "@/entities/delivery/model/delivery.query-keys"

export function useDeliveryByTicketQuery(ticketId: number | null | undefined) {
  return useQuery({
    queryKey:
      ticketId != null
        ? deliveryQueryKeys.byTicket(ticketId)
        : ["delivery", "ticket", "disabled"],
    queryFn: () => getDeliveryByTicket(ticketId as number),
    enabled: ticketId != null,
  })
}
