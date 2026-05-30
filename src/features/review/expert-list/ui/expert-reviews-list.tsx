"use client"

import { useCallback, useMemo, useRef } from "react"
import { Loader2, MessageSquareText } from "lucide-react"

import { Text } from "@/shared/ui/text"

import { useExpertReviewsQuery } from "../model/use-expert-reviews-query"
import { ExpertReviewCard } from "./expert-review-card"

type Props = {
  expertProfileId: number
  /** count 가 0 이면 빈 상태 메시지만 보여주고 쿼리 자체를 보내지 않는다. */
  reviewCount: number
}

export function ExpertReviewsList({ expertProfileId, reviewCount }: Props) {
  const query = useExpertReviewsQuery(expertProfileId, reviewCount > 0)
  // 멤버 표현식 대신 지역 변수로 구조분해해야 메모이제이션이 보존된다.
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = query

  const reviews = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  )

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  if (reviewCount === 0) {
    return (
      <EmptyState message="등록된 리뷰가 없습니다" />
    )
  }

  if (query.isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <EmptyState message="리뷰를 불러오지 못했어요" />
    )
  }

  if (reviews.length === 0) {
    return <EmptyState message="공개된 리뷰가 없습니다" />
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <ExpertReviewCard key={review.reviewId} review={review} />
      ))}
      {query.hasNextPage && (
        <>
          <div ref={sentinelRef} className="h-8" aria-hidden />
          {query.isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-12">
      <MessageSquareText className="text-muted-foreground/40" size={48} />
      <Text
        as="p"
        typography="body2-regular"
        className="text-muted-foreground"
      >
        {message}
      </Text>
    </div>
  )
}
