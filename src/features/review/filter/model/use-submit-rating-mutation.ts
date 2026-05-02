"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { submitRating } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

/**
 * POST /v1/api/review/{reviewId}/rating — 별점 제출.
 * 성공 시 모든 review 캐시 invalidate (filter / detail / mySummary / list).
 */
export function useSubmitRatingMutation(reviewId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rating: number) => submitRating(reviewId, { rating }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.all })
    },
  })
}
