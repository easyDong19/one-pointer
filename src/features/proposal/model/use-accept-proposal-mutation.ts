"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { acceptProposal } from "@/entities/ticket/api/ticket.service"
import { proposalQueryKeys } from "@/entities/proposal/model/proposal.query-keys"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

/**
 * `POST /v1/api/ticket/proposal/{proposalId}/accept` — 제안 수락 (의뢰인).
 *
 * onSuccess: 응답의 chatRoomId 로 채팅방 이동. 의뢰 상세/제안 목록 invalidate.
 */
export function useAcceptProposalMutation(ticketId: number) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (proposalId: number) => acceptProposal(proposalId),
    onSuccess: (data) => {
      toast.success("제안을 수락했어요")
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticketId) })
      queryClient.invalidateQueries({ queryKey: proposalQueryKeys.byTicket(ticketId) })
      if (data?.chatRoomId) {
        router.push(`/chat/${data.chatRoomId}`)
      }
    },
    onError: (error) => {
      console.error("[accept-proposal]", error)
      toast.error(error instanceof Error ? error.message : "제안 수락에 실패했어요")
    },
  })
}
