"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  rejectDelivery,
  type RejectDeliveryRequest,
} from "@/entities/delivery/api/delivery.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import { deliveryQueryKeys } from "@/entities/delivery/model/delivery.query-keys"

export function useRejectDeliveryMutation(
  roomId: string,
  ticketId: number,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      deliveryId,
      input,
    }: {
      deliveryId: number
      input: RejectDeliveryRequest
    }) => rejectDelivery(deliveryId, input),
    onSuccess: () => {
      toast.success("작업물을 거절했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.byTicket(ticketId) })
    },
    onError: (error) => {
      console.error("[reject-delivery]", error)
      toast.error(error instanceof Error ? error.message : "작업물 거절에 실패했어요")
    },
  })
}
