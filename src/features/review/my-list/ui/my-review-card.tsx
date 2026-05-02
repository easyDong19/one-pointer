"use client"

import Link from "next/link"
import { ChevronRight, EyeOff, MessageCircle, User } from "lucide-react"

import type { MyReviewCard as MyReviewCardData } from "@/entities/review/api/review.schema"
import {
  REVIEW_STATUS_LABEL,
  TICKET_TYPE_LABEL,
} from "@/entities/review/lib/review.constants"
import { StarRatingDisplay } from "@/features/review/detail/ui/star-rating-display"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

type Props = {
  review: MyReviewCardData
}

/**
 * 마이페이지 내 리뷰 카드.
 *
 * status 별 진입점이 다름:
 *   - FILTERING : `/reviews/{id}/filter` (필터링 페이지) — Phase D 에서
 *   - WAITING_RATING : `/reviews/{id}/filter` (별점 제출)
 *   - PUBLISHED·PUBLISHED_NO_RATING·HIDDEN : `/reviews/{id}` (상세)
 *   - SNAPSHOT_CREATED : 진입 막음 (status 라벨만)
 */
export function MyReviewCard({ review }: Props) {
  const isFilterable = review.status === "FILTERING" || review.status === "WAITING_RATING"
  const href = isFilterable
    ? `/reviews/${review.reviewId}/filter`
    : `/reviews/${review.reviewId}`
  const dateLabel = formatDate(review.publishedAt ?? review.createdAt)

  const cardClass = "border-border hover:bg-muted/30 group flex flex-col gap-3 rounded-xl border p-4 transition-colors"

  const inner = (
    <>
      <header className="flex items-center gap-3">
        <Avatar
          imageUrl={review.expertProfile.profileImageUrl}
          nickname={review.expertProfile.nickname}
        />
        <div className="min-w-0 flex-1">
          <Text
            as="div"
            typography="caption1-bold"
            className="text-foreground truncate"
          >
            {review.expertProfile.nickname}
          </Text>
          <Text
            as="div"
            typography="caption2-medium"
            className="text-muted-foreground tabular-nums"
          >
            {dateLabel}
          </Text>
        </div>
        <StatusBadge status={review.status} isFilterable={isFilterable} />
      </header>

      <div className="flex flex-col gap-1">
        {review.ticketType && (
          <Text
            as="div"
            typography="caption2-medium"
            className="text-muted-foreground"
          >
            {TICKET_TYPE_LABEL[review.ticketType]} 의뢰
          </Text>
        )}
        <Text
          as="div"
          typography="body2-bold"
          className="text-foreground line-clamp-1"
        >
          {review.ticketTitle}
        </Text>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {review.rating != null ? (
            <StarRatingDisplay rating={review.rating} size="sm" />
          ) : (
            <Text
              as="span"
              typography="caption2-medium"
              className="text-muted-foreground"
            >
              별점 없음
            </Text>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-3">
          <MetricItem
            icon={<MessageCircle className="h-3 w-3" />}
            label={`${review.totalMessageCount}회`}
          />
          {review.hiddenMessageCount > 0 && (
            <MetricItem
              icon={<EyeOff className="h-3 w-3" />}
              label={`비공개 ${review.hiddenMessageCount}`}
            />
          )}
          <ChevronRight className="text-muted-foreground/60 group-hover:text-foreground h-4 w-4 transition-colors" />
        </div>
      </div>
    </>
  )

  if (review.status === "SNAPSHOT_CREATED") {
    return (
      <div className={cn(cardClass, "cursor-not-allowed opacity-70")}>
        {inner}
      </div>
    )
  }

  return (
    <Link href={href} className={cardClass}>
      {inner}
    </Link>
  )
}

function StatusBadge({
  status,
  isFilterable,
}: {
  status: MyReviewCardData["status"]
  isFilterable: boolean
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium tabular-nums",
        isFilterable
          ? "bg-primary-light text-primary"
          : "bg-muted text-muted-foreground",
      )}
    >
      {REVIEW_STATUS_LABEL[status]}
    </span>
  )
}

function MetricItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {icon}
      <Text as="span" typography="caption2-medium" className="tabular-nums">
        {label}
      </Text>
    </span>
  )
}

function Avatar({
  imageUrl,
  nickname,
}: {
  imageUrl: string | null | undefined
  nickname: string
}) {
  return (
    <div className="bg-muted relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <User className="text-muted-foreground/40 h-4 w-4" />
      )}
    </div>
  )
}
