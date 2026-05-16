"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { rejectDirectRequest } from "@/entities/ticket/api/ticket.service"
import { ticketQueryKeys } from "@/entities/ticket/model/ticket.query-keys"

export function useRejectDirectRequestMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ticketId: number) => rejectDirectRequest(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.directRequestReceived(),
      })
    },
  })
}
