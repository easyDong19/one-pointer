"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getExpertReviews } from "@/entities/review/api/review.service"
import { reviewQueryKeys } from "@/entities/review/model/review.query-keys"

const PAGE_SIZE = 10

/**
 * `GET /v1/api/review/expert/{expertProfileId}` cursor 기반 무한 쿼리.
 * 비로그인 게스트도 접근 가능 (서버에서 PUBLIC 만 반환).
 */
export function useExpertReviewsQuery(expertProfileId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: reviewQueryKeys.byExpert(expertProfileId, { size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getExpertReviews(expertProfileId, {
        cursor: pageParam ?? undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled: enabled && Number.isFinite(expertProfileId) && expertProfileId > 0,
  })
}
