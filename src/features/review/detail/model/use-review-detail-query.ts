"use client"

import { useQuery } from "@tanstack/react-query"

import { getReview } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

/** GET /v1/api/review/{reviewId} — 공개 리뷰 상세 (게스트 접근 가능) */
export function useReviewDetailQuery(reviewId: number) {
  return useQuery({
    queryKey: reviewQueryKeys.detail(reviewId),
    queryFn: () => getReview(reviewId),
    enabled: Number.isFinite(reviewId) && reviewId > 0,
  })
}
