"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createProposal,
  type CreateProposalRequest,
} from "@/entities/proposal/api/proposal.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

/**
 * `POST /v1/api/proposal` — 제안서 작성 (전문가).
 */
export function useCreateProposalMutation(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProposalRequest) => createProposal(input),
    onSuccess: () => {
      toast.success("제안서를 보냈어요")
      queryClient.invalidateQueries({ queryKey: proposalQueryKeys.byTicket(ticketId) })
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticketId) })
      queryClient.invalidateQueries({ queryKey: ["proposal", "my", "in-progress"] })
    },
    onError: (error) => {
      console.error("[create-proposal]", error)
      toast.error(error instanceof Error ? error.message : "제안서 전송에 실패했어요")
    },
  })
}
