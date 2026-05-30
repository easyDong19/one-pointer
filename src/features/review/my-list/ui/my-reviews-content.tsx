"use client"

import { useCallback, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"

import { Text } from "@/shared/ui/text"

import { useMyReviewsQuery } from "../model/use-my-reviews-query"
import { useMyReviewSummaryQuery } from "../model/use-my-review-summary-query"
import { MyReviewCard } from "./my-review-card"
import { MyReviewsEmpty } from "./my-reviews-empty"
import { ReviewSummaryBanner } from "./review-summary-banner"

/**
 * /mypage/reviews 본체.
 * - 상단: 평균 별점 + 총 개수 배너
 * - 본문: 무한 스크롤 카드 list (status 별 진입점 분기는 카드 내부)
 */
export function MyReviewsContent() {
  const summary = useMyReviewSummaryQuery()
  const list = useMyReviewsQuery()
  // 멤버 표현식 대신 지역 변수로 구조분해해야 메모이제이션이 보존된다.
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = list

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

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Text as="h1" typography="title-bold" className="text-foreground">
          리뷰 관리
        </Text>
        <Text typography="caption1-medium" className="text-muted-foreground">
          내가 작성한 리뷰를 확인하고 필터링·별점을 마무리할 수 있어요
        </Text>
      </header>

      {summary.data && (
        <ReviewSummaryBanner
          averageRating={summary.data.averageRating}
          reviewCount={summary.data.reviewCount}
        />
      )}

      {list.isLoading ? (
        <CenteredLoader />
      ) : list.isError ? (
        <ErrorState onRetry={() => list.refetch()} />
      ) : reviews.length === 0 ? (
        <MyReviewsEmpty />
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => (
            <MyReviewCard key={review.reviewId} review={review} />
          ))}
          {list.hasNextPage && (
            <>
              <div ref={sentinelRef} className="h-8" aria-hidden />
              {list.isFetchingNextPage && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  )
}

function CenteredLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-2">
      <Text typography="body2-bold" className="text-foreground">
        리뷰를 불러오지 못했어요
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="border-border text-foreground hover:bg-muted/40 rounded-lg border px-3 py-1.5 text-sm transition-colors"
      >
        다시 불러오기
      </button>
    </div>
  )
}
