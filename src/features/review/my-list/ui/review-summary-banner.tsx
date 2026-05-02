"use client"

import { Star } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  averageRating: number | null
  reviewCount: number
}

/** 마이페이지 리뷰 상단 요약 배너 — 평균 별점 + 총 리뷰 수 */
export function ReviewSummaryBanner({ averageRating, reviewCount }: Props) {
  const ratingText =
    averageRating != null && Number.isFinite(averageRating)
      ? averageRating.toFixed(1)
      : "—"

  return (
    <section
      className={cn(
        "border-border bg-muted/30 flex items-center gap-4 rounded-xl border p-4",
      )}
    >
      <div className="bg-background flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
        <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
      </div>
      <div className="min-w-0 flex-1">
        <Text
          as="div"
          typography="body1-bold"
          className="text-foreground tabular-nums"
        >
          평균 {ratingText}점
        </Text>
        <Text
          as="div"
          typography="caption2-medium"
          className="text-muted-foreground tabular-nums"
        >
          총 {reviewCount}개의 리뷰
        </Text>
      </div>
    </section>
  )
}
