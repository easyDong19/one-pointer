"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import { completeOfflineTicket } from "@/entities/ticket/api/ticket.service"

/**
 * `POST /v1/api/ticket/{id}/complete` — 오프라인 거래 완료.
 *
 * 성공 시 chat detail invalidate → 서버가 곧 REVIEW_PENDING 배너로 전환.
 */
export function useCompleteOfflineTicketMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: number) => completeOfflineTicket(ticketId),
    onSuccess: () => {
      toast.success("거래가 완료되었어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[complete-offline-ticket]", error)
      toast.error(error instanceof Error ? error.message : "거래 완료에 실패했어요")
    },
  })
}
