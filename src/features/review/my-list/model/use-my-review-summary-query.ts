"use client"

import { useQuery } from "@tanstack/react-query"

import { getMyReviewSummary } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

/** GET /v1/api/review/my-summary — 평균 별점 + 리뷰 개수 */
export function useMyReviewSummaryQuery() {
  return useQuery({
    queryKey: reviewQueryKeys.mySummary,
    queryFn: getMyReviewSummary,
  })
}
