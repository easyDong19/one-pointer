"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { confirmAgreement } from "@/entities/agreement/api/agreement.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

/**
 * `POST /v1/api/agreement/{id}/confirm` — 의뢰인 승인.
 *
 * 성공 시 PAYMENT_PENDING 단계로 진입.
 */
export function useConfirmAgreementMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => confirmAgreement(id),
    onSuccess: () => {
      toast.success("합의서를 승인했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[confirm-agreement]", error)
      toast.error(error instanceof Error ? error.message : "승인에 실패했어요")
    },
  })
}
