"use client"

import { useQuery } from "@tanstack/react-query"

import { getProposalsByTicket } from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"

/**
 * `GET /v1/api/proposal/ticket/{ticketId}` — 의뢰별 제안 목록 (의뢰인 시점).
 *
 * 백엔드는 plain List 반환 (커서 페이지네이션 X).
 */
export function useProposalsByTicketQuery(
  ticketId: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: proposalQueryKeys.byTicket(ticketId ?? -1),
    queryFn: () => getProposalsByTicket(ticketId!),
    enabled: enabled && typeof ticketId === "number" && ticketId > 0,
  })
}
