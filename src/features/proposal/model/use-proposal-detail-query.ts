"use client"

import { useQuery } from "@tanstack/react-query"

import { getProposal } from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"

/**
 * `GET /v1/api/proposal/{id}` — 제안 상세 (의뢰인 시점).
 */
export function useProposalDetailQuery(
  proposalId: number | null | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: proposalQueryKeys.detail(proposalId ?? -1),
    queryFn: () => getProposal(proposalId!),
    enabled: enabled && typeof proposalId === "number" && proposalId > 0,
  })
}
