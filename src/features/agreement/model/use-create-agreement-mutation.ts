"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createAgreement,
  type CreateAgreementRequest,
} from "@/entities/agreement/api/agreement.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

/**
 * `POST /v1/api/agreement` — 합의서 작성 (전문가).
 *
 * onSuccess: chat detail invalidate → AGREEMENT 메시지 도착 + 배너가 PAYMENT_WAITING/PENDING 으로 전환.
 */
export function useCreateAgreementMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateAgreementRequest) => createAgreement(input),
    onSuccess: () => {
      toast.success("합의서를 작성했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[create-agreement]", error)
      toast.error(error instanceof Error ? error.message : "합의서 작성에 실패했어요")
    },
  })
}
