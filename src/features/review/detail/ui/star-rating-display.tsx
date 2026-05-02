"use client"

import { Star } from "lucide-react"

import { cn } from "@/shared/lib/utils"

type Props = {
  rating: number | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

/**
 * 읽기 전용 별점 표시. rating null 이면 빈 별 5개.
 * 인터랙티브 입력은 Phase REVIEW-D 의 StarRatingInput 별도.
 */
export function StarRatingDisplay({ rating, size = "md", className }: Props) {
  const filled = Math.max(0, Math.min(5, Math.round(rating ?? 0)))
  const label = rating != null ? `${rating}점` : "별점 없음"

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= filled
        return (
          <Star
            key={index}
            className={cn(
              SIZE[size],
              isFilled
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground/30 fill-transparent",
            )}
          />
        )
      })}
    </div>
  )
}
