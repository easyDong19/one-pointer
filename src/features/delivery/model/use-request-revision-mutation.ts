"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  requestRevision,
  type RequestRevisionRequest,
} from "@/entities/delivery/api/delivery.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import { deliveryQueryKeys } from "@/entities/delivery/model/delivery.query-keys"

export function useRequestRevisionMutation(
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
      input: RequestRevisionRequest
    }) => requestRevision(deliveryId, input),
    onSuccess: () => {
      toast.success("수정을 요청했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
      queryClient.invalidateQueries({ queryKey: deliveryQueryKeys.byTicket(ticketId) })
    },
    onError: (error) => {
      console.error("[request-revision]", error)
      toast.error(error instanceof Error ? error.message : "수정 요청에 실패했어요")
    },
  })
}
