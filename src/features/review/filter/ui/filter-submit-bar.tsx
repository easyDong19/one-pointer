"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import type { FilteringView } from "@/entities/review/api/review.service"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { StarRatingInput } from "./star-rating-input"

type Props = {
  view: FilteringView
  isCompleting: boolean
  isSubmittingRating: boolean
  onComplete: () => void
  onSubmitRating: (rating: number) => void
}

/**
 * 필터링 페이지 하단 sticky 액션 바.
 * status 별로 다른 액션 노출:
 *   - FILTERING       → "필터링 완료" 버튼
 *   - WAITING_RATING  → 별점 입력 + "별점 제출"
 *   - 그 외           → 정보 안내 (액션 없음)
 */
export function FilterSubmitBar({
  view,
  isCompleting,
  isSubmittingRating,
  onComplete,
  onSubmitRating,
}: Props) {
  const status = view.status ?? "FILTERING"

  return (
    <div className="bg-background/95 border-border sticky bottom-0 z-20 border-t backdrop-blur-md">
      <div className="px-4 py-3 md:px-6 lg:px-10">
        {status === "FILTERING" ? (
          <FilteringActions
            myDone={view.myFilteringCompleted ?? false}
            isCompleting={isCompleting}
            onComplete={onComplete}
          />
        ) : status === "WAITING_RATING" ? (
          <RatingActions
            currentRating={view.rating ?? null}
            isSubmitting={isSubmittingRating}
            onSubmit={onSubmitRating}
          />
        ) : (
          <Text typography="caption1-medium" className="text-muted-foreground">
            이 리뷰는 더 이상 수정할 수 없습니다.
          </Text>
        )}
      </div>
    </div>
  )
}

function FilteringActions({
  myDone,
  isCompleting,
  onComplete,
}: {
  myDone: boolean
  isCompleting: boolean
  onComplete: () => void
}) {
  if (myDone) {
    return (
      <Text typography="caption1-medium" className="text-muted-foreground">
        본인 필터링이 완료되었습니다. 상대방 완료를 기다리고 있어요.
      </Text>
    )
  }
  return (
    <button
      type="button"
      onClick={onComplete}
      disabled={isCompleting}
      className={cn(
        "bg-primary text-primary-foreground hover:bg-primary-hover flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors",
        isCompleting && "cursor-not-allowed opacity-70",
      )}
    >
      {isCompleting && <Loader2 className="h-4 w-4 animate-spin" />}
      필터링 완료
    </button>
  )
}

function RatingActions({
  currentRating,
  isSubmitting,
  onSubmit,
}: {
  currentRating: number | null
  isSubmitting: boolean
  onSubmit: (rating: number) => void
}) {
  const [pending, setPending] = useState<number | null>(currentRating)
  const value = pending ?? currentRating
  const canSubmit = value != null && value !== currentRating && !isSubmitting

  return (
    <div className="flex flex-col gap-3">
      <StarRatingInput
        value={value}
        onChange={(r) => setPending(r)}
        disabled={isSubmitting}
      />
      <button
        type="button"
        onClick={() => value != null && onSubmit(value)}
        disabled={!canSubmit}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors",
          canSubmit
            ? "bg-primary text-primary-foreground hover:bg-primary-hover"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {currentRating != null ? "별점 수정" : "별점 제출"}
      </button>
    </div>
  )
}
