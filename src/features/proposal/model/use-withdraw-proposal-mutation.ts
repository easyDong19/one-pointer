"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { withdrawProposal } from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"

/**
 * `POST /v1/api/proposal/{id}/withdraw` — 제안 철회 (전문가).
 */
export function useWithdrawProposalMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (proposalId: number) => withdrawProposal(proposalId),
    onSuccess: (_, proposalId) => {
      toast.success("제안을 철회했어요")
      queryClient.invalidateQueries({ queryKey: proposalQueryKeys.myDetail(proposalId) })
      queryClient.invalidateQueries({ queryKey: ["proposal", "my", "in-progress"] })
      queryClient.invalidateQueries({ queryKey: ["proposal", "my", "completed"] })
    },
    onError: (error) => {
      console.error("[withdraw-proposal]", error)
      toast.error(error instanceof Error ? error.message : "제안 철회에 실패했어요")
    },
  })
}
