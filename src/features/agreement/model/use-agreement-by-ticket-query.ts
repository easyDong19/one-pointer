"use client"

import { useQuery } from "@tanstack/react-query"

import { getAgreementByTicket } from "@/entities/agreement/api/agreement.service"
import { agreementQueryKeys } from "@/entities/agreement/model/agreement.query-keys"

/**
 * `GET /v1/api/agreement/ticket/{ticketId}` — 해당 티켓의 (가장 최근) 합의서.
 *
 * `ticketId == null` 일 때 비활성화. 재제안 prefill / 메시지 카드 상세 / 마감 연장에 사용.
 */
export function useAgreementByTicketQuery(ticketId: number | null | undefined) {
  return useQuery({
    queryKey:
      ticketId != null
        ? agreementQueryKeys.byTicket(ticketId)
        : ["agreement", "ticket", "disabled"],
    queryFn: () => getAgreementByTicket(ticketId as number),
    enabled: ticketId != null,
  })
}
