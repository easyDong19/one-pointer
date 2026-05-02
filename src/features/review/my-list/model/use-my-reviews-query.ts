"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getMyReviews } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

const PAGE_SIZE = 20

/** GET /v1/api/review/my-reviews — 내 리뷰 목록 (의뢰인 시점) */
export function useMyReviewsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: reviewQueryKeys.myList({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getMyReviews({
        cursor: pageParam ?? undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
  })
}
