"use client"

import { useQuery } from "@tanstack/react-query"

import { getDispute } from "@/entities/dispute/api/dispute.service"
import { disputeQueryKeys } from "@/entities/dispute/model/dispute.query-keys"

/**
 * `GET /v1/api/disputes/{disputeId}` — 분쟁 상세 (MyDisputeDetail) 조회.
 *
 * disputeId 가 null 이면 disabled. 채팅 배너처럼 ticketId 진입은
 * `useDisputeByTicketQuery` 로 먼저 disputeId 를 얻은 뒤 이 훅에 전달.
 */
export function useDisputeDetailQuery(disputeId: number | null | undefined) {
  return useQuery({
    queryKey:
      disputeId != null
        ? disputeQueryKeys.detail(disputeId)
        : ["dispute", "detail", "disabled"],
    queryFn: () => getDispute(disputeId as number),
    enabled: disputeId != null,
  })
}
