"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { rejectAgreement } from "@/entities/agreement/api/agreement.service"
import { agreementQueryKeys } from "@/entities/agreement/model/agreement.query-keys"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

/**
 * `POST /v1/api/agreement/{id}/reject` — 전문가 거절.
 *
 * 성공 시 전문가 시점에 AGREEMENT_REPROPOSE 배너 노출.
 */
export function useRejectAgreementMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => rejectAgreement(id),
    onSuccess: () => {
      toast.success("합의서를 거절했어요")
      queryClient.invalidateQueries({ queryKey: agreementQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[reject-agreement]", error)
      toast.error(error instanceof Error ? error.message : "거절에 실패했어요")
    },
  })
}
