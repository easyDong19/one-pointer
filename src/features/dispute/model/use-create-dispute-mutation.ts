"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import {
  createDispute,
  type CreateDisputeRequest,
} from "@/entities/dispute/api/dispute.service"

/**
 * `POST /v1/api/disputes` — 분쟁 신청 (의뢰인).
 *
 * docs/app/chat.md §7.5 — REFUND_IN_PROGRESS EXPERT_REJECTED CLIENT 의 "분쟁 신청".
 * 성공 시 chat detail invalidate → DISPUTE_IN_PROGRESS 배너로 전환.
 */
export function useCreateDisputeMutation(roomId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateDisputeRequest) => createDispute(input),
    onSuccess: () => {
      toast.success("분쟁이 접수되었어요. 운영팀 검토 후 알려드릴게요")
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.roomDetail(roomId) })
    },
    onError: (error) => {
      console.error("[create-dispute]", error)
      toast.error(error instanceof Error ? error.message : "분쟁 신청에 실패했어요")
    },
  })
}
