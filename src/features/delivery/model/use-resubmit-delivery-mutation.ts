"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  resubmitDelivery,
  type ResubmitDeliveryRequest,
} from "@/entities/delivery/api/delivery.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

export function useResubmitDeliveryMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      deliveryId,
      input,
    }: {
      deliveryId: number
      input: ResubmitDeliveryRequest
    }) => resubmitDelivery(deliveryId, input),
    onSuccess: () => {
      toast.success("수정본을 제출했어요. 72시간 내 승인되지 않으면 자동 승인됩니다")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[resubmit-delivery]", error)
      toast.error(error instanceof Error ? error.message : "수정본 제출에 실패했어요")
    },
  })
}
