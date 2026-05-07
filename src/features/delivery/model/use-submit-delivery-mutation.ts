"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  submitDelivery,
  type SubmitDeliveryRequest,
} from "@/entities/delivery/api/delivery.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

export function useSubmitDeliveryMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitDeliveryRequest) => submitDelivery(input),
    onSuccess: () => {
      toast.success("작업물을 제출했어요. 72시간 내 승인되지 않으면 자동 승인됩니다")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[submit-delivery]", error)
      toast.error(error instanceof Error ? error.message : "작업물 제출에 실패했어요")
    },
  })
}
