"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import {
  payEscrow,
  type EscrowPaymentRequest,
} from "@/entities/payment/api/payment.service"

export function useEscrowPaymentMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: EscrowPaymentRequest) => payEscrow(input),
    onSuccess: () => {
      toast.success("결제가 완료되었어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[escrow-payment]", error)
      toast.error(error instanceof Error ? error.message : "결제 확인에 실패했어요")
    },
  })
}
