"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { confirmFilteringComplete } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

/**
 * POST /v1/api/review/{reviewId}/filtering/complete — 본인 필터링 완료 마킹.
 * 성공 시 filtering / mySummary / myList 캐시 invalidate (status 변할 수 있음).
 */
export function useCompleteFilteringMutation(reviewId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => confirmFilteringComplete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.filtering(reviewId) })
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.mySummary })
      queryClient.invalidateQueries({ queryKey: ["review", "my", "list"] })
    },
  })
}
