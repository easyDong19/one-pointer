"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { approveDelivery } from "@/entities/delivery/api/delivery.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import { deliveryQueryKeys } from "@/entities/delivery/model/delivery.query-keys"

export function useApproveDeliveryMutation(
  roomId: string,
  ticketId: number,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deliveryId: number) => approveDelivery(deliveryId),
    onSuccess: () => {
      toast.success("작업물을 승인했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.byTicket(ticketId) })
    },
    onError: (error) => {
      console.error("[approve-delivery]", error)
      toast.error(error instanceof Error ? error.message : "작업물 승인에 실패했어요")
    },
  })
}
