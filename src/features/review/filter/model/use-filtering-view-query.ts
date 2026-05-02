"use client"

import { useQuery } from "@tanstack/react-query"

import { getFilteringView } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

/** GET /v1/api/review/{reviewId}/filtering — 필터링 뷰 (CLIENT/EXPERT 본인 시점) */
export function useFilteringViewQuery(reviewId: number) {
  return useQuery({
    queryKey: reviewQueryKeys.filtering(reviewId),
    queryFn: () => getFilteringView(reviewId),
    enabled: Number.isFinite(reviewId) && reviewId > 0,
  })
}
