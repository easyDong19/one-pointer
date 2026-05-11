"use client"

import { useQuery } from "@tanstack/react-query"

import { getMyProposal } from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"

/**
 * `GET /v1/api/proposal/my/{id}` — 내 제안 상세 (전문가 시점).
 */
export function useMyProposalDetailQuery(
  proposalId: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: proposalQueryKeys.myDetail(proposalId ?? -1),
    queryFn: () => getMyProposal(proposalId!),
    enabled: enabled && typeof proposalId === "number" && proposalId > 0,
  })
}
