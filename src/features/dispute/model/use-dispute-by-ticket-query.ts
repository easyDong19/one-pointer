"use client"

import { useQuery } from "@tanstack/react-query"

import { getDisputeByTicket } from "@/entities/dispute/api/dispute.service"

/**
 * `GET /v1/api/disputes/ticket/{ticketId}` — 채팅 배너의 ticketId 로부터 disputeId 도출.
 *
 * 채팅 배너는 ticketId 만 보유하므로 분쟁 상세 다이얼로그가 ticketId 진입 시
 * 이 훅으로 disputeId 를 먼저 얻은 뒤 `useDisputeDetailQuery` 로 chained fetch.
 */
export function useDisputeByTicketQuery(ticketId: number | null | undefined) {
  return useQuery({
    queryKey:
      ticketId != null
        ? ["dispute", "by-ticket", ticketId]
        : ["dispute", "by-ticket", "disabled"],
    queryFn: () => getDisputeByTicket(ticketId as number),
    enabled: ticketId != null,
  })
}
