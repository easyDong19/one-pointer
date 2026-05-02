"use client"

import Link from "next/link"
import { ArrowUpRight, Clock, MessageCircle, ThumbsUp, User } from "lucide-react"

import type { ReviewDetail } from "@/entities/review/api/review.service"
import { TICKET_TYPE_LABEL } from "@/entities/review/lib/review.constants"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"

import { StarRatingDisplay } from "./star-rating-display"

type Props = {
  review: ReviewDetail
}

/**
 * 리뷰 상세 페이지의 헤더.
 * - 큰 별점 + 의뢰인 프로필 + 의뢰 정보 + 공개일 + 도움이됐어요 + 커뮤니케이션 메트릭
 */
export function ReviewHeader({ review }: Props) {
  const { clientProfile, ticketType, ticketTitle, ticketId, publishedAt, helpfulCount, communicationMetrics, rating } =
    review

  return (
    <header className="flex flex-col gap-4">
      <RatingHero rating={rating} />

      <div className="flex items-center gap-3">
        <Avatar
          imageUrl={clientProfile.profileImageUrl}
          nickname={clientProfile.nickname}
        />
        <div className="min-w-0 flex-1">
          <Text
            as="div"
            typography="body2-bold"
            className="text-foreground truncate"
          >
            {clientProfile.nickname}
          </Text>
          <Text
            as="div"
            typography="caption2-medium"
            className="text-muted-foreground tabular-nums"
          >
            {formatDate(publishedAt)}
          </Text>
        </div>
      </div>

      {ticketTitle && (
        <TicketCard
          ticketId={ticketId}
          typeLabel={TICKET_TYPE_LABEL[ticketType]}
          title={ticketTitle}
        />
      )}

      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <MetricItem
          icon={<Clock className="h-3.5 w-3.5" />}
          label={`평균 응답 ${communicationMetrics.averageResponseMinutes}분`}
        />
        <MetricItem
          icon={<MessageCircle className="h-3.5 w-3.5" />}
          label={`총 ${communicationMetrics.totalMessageCount}회 메시지`}
        />
        {helpfulCount > 0 && (
          <MetricItem
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
            label={`도움됐어요 ${helpfulCount}`}
          />
        )}
      </div>
    </header>
  )
}

function RatingHero({ rating }: { rating: number | null }) {
  const ratingLabel =
    rating != null && Number.isFinite(rating) ? rating.toFixed(1) : "—"

  return (
    <>
      {/* 모바일/태블릿: 별점만 큰 사이즈 */}
      <div className="lg:hidden">
        <StarRatingDisplay rating={rating} size="lg" />
      </div>

      {/* 데스크탑: 큰 숫자 + 작은 별 (sidebar hero) */}
      <div className="hidden flex-col items-start gap-1 lg:flex">
        <span className="text-foreground text-4xl font-bold tabular-nums leading-none">
          {ratingLabel}
        </span>
        <StarRatingDisplay rating={rating} size="md" />
      </div>
    </>
  )
}

function TicketCard({
  ticketId,
  typeLabel,
  title,
}: {
  ticketId: number | undefined
  typeLabel: string
  title: string
}) {
  const inner = (
    <>
      <Text
        as="div"
        typography="caption2-medium"
        className="text-muted-foreground"
      >
        {typeLabel} 의뢰
      </Text>
      <Text
        as="div"
        typography="body2-bold"
        className="text-foreground truncate"
      >
        {title}
      </Text>
    </>
  )

  if (!ticketId) {
    return (
      <div className="bg-muted/40 rounded-xl px-4 py-3">
        {inner}
      </div>
    )
  }

  return (
    <Link
      href={`/tickets/${ticketId}`}
      className="group bg-muted/40 hover:bg-muted/60 flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
    >
      <div className="min-w-0 flex-1">{inner}</div>
      <ArrowUpRight className="text-muted-foreground group-hover:text-foreground h-4 w-4 shrink-0 transition-colors" />
    </Link>
  )
}

function MetricItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
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
    <div className="bg-muted relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={nickname} className="h-full w-full object-cover" />
      ) : (
        <User className="text-muted-foreground/40 h-5 w-5" />
      )}
    </div>
  )
}
