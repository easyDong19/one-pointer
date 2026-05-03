"use client"

import { useQuery } from "@tanstack/react-query"

import { getEscrowPaymentByTicket } from "@/entities/payment/api/payment.service"

/**
 * `GET /v1/api/payment/escrow/ticket/{ticketId}` — 분쟁 신청 시 escrowPaymentId 도출용.
 *
 * ChatBannerResponse / EscrowRefund 모두 escrowPaymentId 필드 없음 → 별도 fetch.
 */
export function useEscrowPaymentByTicketQuery(
  ticketId: number | null | undefined,
) {
  return useQuery({
    queryKey:
      ticketId != null
        ? ["payment", "escrow", "ticket", ticketId]
        : ["payment", "escrow", "ticket", "disabled"],
    queryFn: () => getEscrowPaymentByTicket(ticketId as number),
    enabled: ticketId != null,
  })
}
