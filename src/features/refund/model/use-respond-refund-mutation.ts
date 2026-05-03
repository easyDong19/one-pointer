"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import {
  respondToRefund,
  type RefundRespondRequest,
} from "@/entities/payment/api/payment.service"

type Variables = { refundRequestId: number; input: RefundRespondRequest }

/**
 * `POST /v1/api/payment/escrow/refund/{id}/respond` — 환불 응답 (전문가).
 *
 * accept=true: 수락. accept=false 면 rejectReason 동봉 (UI 검증).
 */
export function useRespondToRefundMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ refundRequestId, input }: Variables) =>
      respondToRefund(refundRequestId, input),
    onSuccess: (_, variables) => {
      toast.success(
        variables.input.accept ? "환불을 승인했어요" : "환불을 거부했어요",
      )
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[respond-refund]", error)
      toast.error(error instanceof Error ? error.message : "응답 전송에 실패했어요")
    },
  })
}
