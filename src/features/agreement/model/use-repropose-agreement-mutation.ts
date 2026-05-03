"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  reproposeAgreement,
  type ReproposeAgreementRequest,
} from "@/entities/agreement/api/agreement.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

type Variables = { id: number; input: ReproposeAgreementRequest }

/**
 * `PUT /v1/api/agreement/{id}/repropose` — 거절된 합의서 재제안 (전문가).
 */
export function useReproposeAgreementMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: Variables) => reproposeAgreement(id, input),
    onSuccess: () => {
      toast.success("합의서를 재제안했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[repropose-agreement]", error)
      toast.error(error instanceof Error ? error.message : "재제안에 실패했어요")
    },
  })
}
