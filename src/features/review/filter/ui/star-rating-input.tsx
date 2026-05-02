"use client"

import { useState } from "react"
import { Star } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  value: number | null
  onChange: (rating: number) => void
  disabled?: boolean
}

/**
 * 1~5 인터랙티브 별점 입력. hover 미리보기 지원.
 * 읽기전용은 features/review/detail/ui/star-rating-display.tsx 사용.
 */
export function StarRatingInput({ value, onChange, disabled }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value ?? 0

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        role="radiogroup"
        aria-label="별점"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= display
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star}점`}
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHover(star)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "rounded transition-transform",
                !disabled && "hover:scale-110",
                disabled && "cursor-not-allowed",
              )}
            >
              <Star
                className={cn(
                  "h-7 w-7",
                  isActive
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground/30 fill-transparent",
                )}
              />
            </button>
          )
        })}
      </div>
      <Text
        as="span"
        typography="caption1-medium"
        className="text-muted-foreground tabular-nums"
      >
        {value != null ? `${value}점` : "선택해주세요"}
      </Text>
    </div>
  )
}
