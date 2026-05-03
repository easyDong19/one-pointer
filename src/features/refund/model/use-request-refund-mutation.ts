"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import {
  requestRefund,
  type RefundRequest,
} from "@/entities/payment/api/payment.service"

/**
 * `POST /v1/api/payment/escrow/refund` — 환불 요청 (의뢰인).
 *
 * RefundZone 은 서버가 결정 (요청 body 에 포함하지 않음).
 * 성공 시 chat detail invalidate → REFUND_IN_PROGRESS REQUESTED 배너로 전환.
 */
export function useRequestRefundMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: RefundRequest) => requestRefund(input),
    onSuccess: () => {
      toast.success("환불 요청이 접수되었어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[request-refund]", error)
      toast.error(error instanceof Error ? error.message : "환불 요청에 실패했어요")
    },
  })
}
