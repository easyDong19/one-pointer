"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  updateAgreementDeadline,
  type UpdateAgreementDeadlineRequest,
} from "@/entities/agreement/api/agreement.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

type Variables = { id: number; input: UpdateAgreementDeadlineRequest }

/**
 * `PATCH /v1/api/agreement/{id}/deadline` — 마감일 연장 (의뢰인).
 *
 * docs/app/chat.md §7.6 — DEADLINE_OVERDUE_CLIENT 의 "마감 연장" 버튼 진입.
 */
export function useUpdateAgreementDeadlineMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: Variables) => updateAgreementDeadline(id, input),
    onSuccess: () => {
      toast.success("마감일을 변경했어요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[update-agreement-deadline]", error)
      toast.error(error instanceof Error ? error.message : "마감일 변경에 실패했어요")
    },
  })
}
