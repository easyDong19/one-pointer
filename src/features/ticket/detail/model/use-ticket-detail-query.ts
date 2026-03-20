import { useQuery } from "@tanstack/react-query"
import { getTicket } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useTicketDetailQuery(ticketId: number) {
  return useQuery({
    queryKey: ticketQueryKeys.detail(ticketId),
    queryFn: () => getTicket(ticketId),
  })
}
